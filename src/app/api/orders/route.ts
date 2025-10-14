import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import { createOrderSchema, orderFilterSchema, OrderItemInput, CreateOrderInput, OrderFilterInput } from '@/schemas/order';
import { withCorsAuthAndValidation, rateLimits } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { calculateTotal } from '@/lib/utils/currency';

// GET /api/orders - Get orders with filtering and pagination
export const GET = withCorsAuthAndValidation(
  orderFilterSchema,
  { origin: true, methods: ['GET'], credentials: false }
)(
  rateLimits.general(
    async (request) => {
      try {
        await dbConnect();
        
        const validated = ((request as unknown) as { validatedData: OrderFilterInput }).validatedData;
        const {
          status,
          paymentStatus,
          dateFrom,
          dateTo,
          customerEmail,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          page = 1,
          limit = 20,
        } = validated;

        // Build query
  const query: Record<string, unknown> = {};
        
        if (status) {
          query.status = status;
        }
        
        if (paymentStatus) {
          query.paymentStatus = paymentStatus;
        }
        
        if (dateFrom || dateTo) {
          const createdAt: Record<string, unknown> = {};
          if (dateFrom) {
            (createdAt as Record<string, unknown>)['$gte'] = new Date(dateFrom);
          }
          if (dateTo) {
            (createdAt as Record<string, unknown>)['$lte'] = new Date(dateTo);
          }
          query.createdAt = createdAt;
        }
        
        if (customerEmail) {
          query['customerInfo.email'] = new RegExp(customerEmail, 'i');
        }

        // Build sort object
  const sort: Record<string, 1 | -1> = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const [orders, total] = await Promise.all([
          Order.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json(
          createApiResponse({
            orders,
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          })
        );
      } catch (error) {
        console.error('[Orders API] Error:', error);
        return NextResponse.json(
          createApiError('Failed to fetch orders'),
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/orders - Create new order
export const POST = withCorsAuthAndValidation(
  createOrderSchema,
  { origin: true, methods: ['POST'], credentials: false }
)(
  rateLimits.general(
  async (request): Promise<NextResponse> => {
      try {
        await dbConnect();
        
        const orderData = ((request as unknown) as { validatedData?: CreateOrderInput }).validatedData!;
        
        // Fetch menu items to get current prices and names
  // Use the schema types for safety
  const menuItemIds = (orderData.items as OrderItemInput[]).map((item) => item.menuItemId);
        const menuItems = await MenuItem.find({
          _id: { $in: menuItemIds },
          active: true,
        }).lean();
        
        // Create a map for quick lookup
        const menuItemMap = new Map(
          menuItems.map(item => [item._id.toString(), item])
        );
        
        // Validate all items exist and build order items
        const orderItems: Array<{
          menuItemId: string;
          name: string;
          price: number;
          quantity: number;
          specialInstructions?: string;
        }> = [];
        let subtotal = 0;
        
        for (const item of orderData.items) {
          const menuItem = menuItemMap.get(item.menuItemId);
          if (!menuItem) {
            return NextResponse.json(
              createApiError(`Menu item with ID ${item.menuItemId} not found`),
              { status: 400 }
            );
          }
          
          const itemTotal = menuItem.price * item.quantity;
          subtotal += itemTotal;
          
          orderItems.push({
            menuItemId: item.menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          });
        }
        
        // Calculate totals (assuming 8% tax rate for now)
        const taxRate = 0.08;
        const totals = calculateTotal(subtotal, taxRate, orderData.tip);
        
        // Create order
        const order = new Order({
          ...orderData,
          items: orderItems,
          subtotal: totals.subtotal,
          tax: totals.tax,
          tip: totals.tip,
          total: totals.total,
          status: 'pending',
          paymentStatus: 'pending',
        });
        
        await order.save();
        
        return NextResponse.json(
          createApiResponse(order, 'Order created successfully'),
          { status: 201 }
        );
      } catch (error) {
        console.error('[Orders API] Create error:', error);
        return NextResponse.json(
          createApiError('Failed to create order'),
          { status: 500 }
        );
      }
    }
  )
);
