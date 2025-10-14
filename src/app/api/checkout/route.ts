import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth/options';
import dbConnect from '@/lib/mongoose';
import type { CheckoutRequest, CheckoutResponse, CheckoutItem } from '@/types/checkout';

// Initialize Stripe with your secret key
const stripeApiVersion = process.env.STRIPE_API_VERSION || '2025-02-24';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key', {
  apiVersion: stripeApiVersion as any,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const body = (await req.json()) as CheckoutRequest;
    const { items, metadata } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request: items array is required' }, { status: 400 });
    }

    // Helper to ensure images array is present
    const sanitizeItem = (item: CheckoutItem) => ({
      name: item.name,
      description: item.description ?? '',
      images: item.imageUrl ? [item.imageUrl] : [],
      unit_amount: Math.max(0, Math.round(item.price * 100)),
      quantity: Math.max(1, Math.floor(item.quantity)),
    });

    const line_items = items.map((i) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: sanitizeItem(i).name,
          description: sanitizeItem(i).description,
          images: sanitizeItem(i).images,
        },
        unit_amount: sanitizeItem(i).unit_amount,
      },
      quantity: sanitizeItem(i).quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Tax (8%)
    const taxAmount = Math.round(subtotal * 0.08 * 100);
    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax', description: '8% sales tax', images: [] },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

    // Delivery fee (fixed $3.99)
    const deliveryFee = 399;
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Delivery Fee', description: 'Standard delivery', images: [] },
        unit_amount: deliveryFee,
      },
      quantity: 1,
    });

    const origin = req.headers.get('origin') || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;

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

    const resBody: CheckoutResponse = { sessionId: checkoutSession.id, url: checkoutSession.url ?? null };
    return NextResponse.json(resBody);
  } catch (error: any) {
    const err = error instanceof Error ? error : new Error('Unknown error during checkout');
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'An error occurred during checkout' }, { status: 500 });
  }
}