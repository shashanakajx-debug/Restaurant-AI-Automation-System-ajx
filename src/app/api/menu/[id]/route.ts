import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MenuItem from '@/models/MenuItem';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth';

const paramsSchema = z.object({
  id: z.string().min(1, 'Menu item ID is required'),
});

// GET /api/menu/[id] - Get menu item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const menuItem = await MenuItem.findById(id).lean();
    
    if (!menuItem) {
      return NextResponse.json(
        createApiError('Menu item not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(createApiResponse(menuItem));
  } catch (error) {
    console.error('[Menu API] Get by ID error:', error);
    return NextResponse.json(
      createApiError('Failed to fetch menu item'),
      { status: 500 }
    );
  }
}

// PUT /api/menu/[id] - Update menu item (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return await requireAuth('admin')(async (authReq: any) => {
    try {
      await dbConnect();
      const updateData = await request.json();
      const { id } = await params;

      const menuItem = await MenuItem.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!menuItem) {
        return NextResponse.json(
          createApiError('Menu item not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse(menuItem, 'Menu item updated successfully')
      );
    } catch (error) {
      console.error('[Menu API] Update error:', error);
      return NextResponse.json(
        createApiError('Failed to update menu item'),
        { status: 500 }
      );
    }
  })(request as any);
}

// DELETE /api/menu/[id] - Delete menu item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return await requireAuth('admin')(async (authReq: any) => {
    try {
      await dbConnect();
      const { id } = await params;

      const menuItem = await MenuItem.findByIdAndDelete(id);
      
      if (!menuItem) {
        return NextResponse.json(
          createApiError('Menu item not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse(null, 'Menu item deleted successfully')
      );
    } catch (error) {
      console.error('[Menu API] Delete error:', error);
      return NextResponse.json(
        createApiError('Failed to delete menu item'),
        { status: 500 }
      );
    }
  })(request as any);
}
