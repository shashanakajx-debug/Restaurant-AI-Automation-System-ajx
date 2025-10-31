// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { requireAdmin } from '@/middleware/auth';
import { createApiResponse, createApiError } from '@/lib/utils/api';

// GET single order
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        createApiError('Order not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(createApiResponse({ order }));
  } catch (error) {
    console.error('[Order GET] Error:', error);
    return NextResponse.json(
      createApiError('Failed to fetch order'),
      { status: 500 }
    );
  }
}

// UPDATE order (PATCH for partial updates) - Admin only
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      const body = await authenticatedReq.json();
      
      // Find and update the order
      const order = await Order.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!order) {
        return NextResponse.json(
          createApiError('Order not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse({ order }, 'Order updated successfully')
      );
    } catch (error) {
      console.error('[Order PATCH] Error:', error);
      return NextResponse.json(
        createApiError('Failed to update order'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}

// UPDATE order (PUT for full replacement) - Admin only
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      const body = await authenticatedReq.json();
      
      const order = await Order.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true, overwrite: true }
      );
      
      if (!order) {
        return NextResponse.json(
          createApiError('Order not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse({ order }, 'Order updated successfully')
      );
    } catch (error) {
      console.error('[Order PUT] Error:', error);
      return NextResponse.json(
        createApiError('Failed to update order'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}

// DELETE order - Admin only
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      
      const order = await Order.findByIdAndDelete(id);
      
      if (!order) {
        return NextResponse.json(
          createApiError('Order not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse(
          { id },
          'Order deleted successfully'
        )
      );
    } catch (error) {
      console.error('[Order DELETE] Error:', error);
      return NextResponse.json(
        createApiError('Failed to delete order'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}