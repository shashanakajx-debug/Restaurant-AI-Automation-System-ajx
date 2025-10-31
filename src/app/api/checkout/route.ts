import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth/options';
import dbConnect from '@/lib/mongoose';
import type { CheckoutRequest, CheckoutResponse, CheckoutItem } from '@/types/checkout';
import Order from '@/models/Order';

function masked(key?: string) {
  if (!key) return 'undefined';
  return key.length > 10 ? `${key.slice(0, 8)}...${key.slice(-4)}` : key;
}
function isLikelyStripeSecret(key?: string) {
  if (!key) return false;
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(key);
}

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  console.log('STRIPE_SECRET_KEY preview:', masked(stripeSecret));

  if (!stripeSecret || !isLikelyStripeSecret(stripeSecret) || stripeSecret.includes('*')) {
    console.error('STRIPE_SECRET_KEY is missing or invalid. Check .env.local / deployment env vars.');
    return NextResponse.json({ error: 'Stripe secret key not configured on server' }, { status: 500 });
  }

  const providedApiVersion = process.env.STRIPE_API_VERSION?.trim();
  if (providedApiVersion) console.log('STRIPE_API_VERSION provided:', providedApiVersion);
  else console.log('No STRIPE_API_VERSION provided; using Stripe SDK default.');

  const stripe = providedApiVersion
    ? new Stripe(stripeSecret, { apiVersion: providedApiVersion as any })
    : new Stripe(stripeSecret);

  try {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const body = (await req.json()) as CheckoutRequest & { paymentMethod?: string };
    const { items, metadata } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request: items array is required' }, { status: 400 });
    }

    const paymentMethod = (body.paymentMethod || metadata?.paymentMethod || 'card').toString().toLowerCase();

    const sanitizeItem = (item: CheckoutItem) => {
      const description = (item.description ?? '').toString().trim();
      const imageUrl = (item.imageUrl ?? '').toString().trim();

      return {
        id: item.id,
        name: item.name,
        description: description === '' ? undefined : description,
        images: imageUrl === '' ? undefined : [imageUrl],
        unit_amount: Math.max(0, Math.round(Number(item.price) * 100)),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        rawPrice: Number(item.price) || 0,
      };
    };

    const sanitizedItems = items.map((i) => sanitizeItem(i as CheckoutItem));

    const subtotal = sanitizedItems.reduce((sum, it) => sum + (it.rawPrice * it.quantity), 0);
    const subtotalCents = Math.round(subtotal * 100);
    const taxAmountCents = Math.round(subtotal * 0.08 * 100);
    const deliveryFeeCents = 399;

    const origin = req.headers.get('origin') || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;

    // ========================
    // CASH / PAY AT COUNTER
    // ========================
    if (['cash', 'counter', 'cod'].includes(paymentMethod)) {
      const totalCents = subtotalCents + taxAmountCents + deliveryFeeCents;
      const total = Number((totalCents / 100).toFixed(2));

      // ✅ FIXED — Added restaurantId and customerInfo fields
      const orderDoc = {
        restaurantId: metadata?.restaurantId ?? 'default_restaurant_id',
        customerInfo: {
          name: session?.user?.name ?? (metadata?.customerName as string) ?? 'Guest',
          email: session?.user?.email ?? (metadata?.customerEmail as string) ?? 'guest@example.com',
        },
        items: sanitizedItems.map((si) => ({
          menuItemId: si.id,
          name: si.name,
          price: si.rawPrice,
          quantity: si.quantity,
        })),
        userId: session?.user?.id ?? session?.user?.email ?? 'guest',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        subtotal: Number((subtotalCents / 100).toFixed(2)),
        tax: Number((taxAmountCents / 100).toFixed(2)),
        deliveryFee: Number((deliveryFeeCents / 100).toFixed(2)),
        total,
        metadata: metadata ?? {},
        status: 'pending',
        createdAt: new Date(),
      };

      const createdOrder = await Order.create(orderDoc);
      const successUrl = `${origin}/checkout/success?order_id=${createdOrder._id}`;
      const resBody: CheckoutResponse = { sessionId: null, url: successUrl };
      return NextResponse.json(resBody);
    }

    // ========================
    // ONLINE / CARD (Stripe Checkout)
    // ========================
    const line_items = sanitizedItems.map((s) => {
      const product_data: any = { name: s.name };
      if (s.description) product_data.description = s.description;
      if (s.images) product_data.images = s.images;

      return {
        price_data: {
          currency: 'usd',
          product_data,
          unit_amount: s.unit_amount,
        },
        quantity: s.quantity,
      };
    });

    if (taxAmountCents > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax', description: '8% sales tax' },
          unit_amount: taxAmountCents,
        },
        quantity: 1,
      });
    }

    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Delivery Fee', description: 'Standard delivery' },
        unit_amount: deliveryFeeCents,
      },
      quantity: 1,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: session?.user?.email ?? undefined,
      metadata: {
        userId: session?.user?.id ?? session?.user?.email ?? 'guest',
        ...(metadata ?? {}),
      },
    });

    const resBody: CheckoutResponse = {
      sessionId: checkoutSession.id,
      url: checkoutSession.url ?? null,
    };
    return NextResponse.json(resBody);
  } catch (error: any) {
    console.error('Stripe/Checkout error (message):', error?.message ?? error);
    if (error?.raw) {
      console.error('Stripe error raw:', {
        type: error.raw.type,
        code: error.raw.code,
        param: error.raw.param,
        detail: error.raw.detail,
        rawType: error.rawType ?? undefined,
      });
    }
    return NextResponse.json({ error: error?.message || 'An error occurred during checkout' }, { status: 500 });
  }
}
