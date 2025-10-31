// app/api/admin/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { requireAdmin } from '@/middleware/auth';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import bcrypt from 'bcryptjs';

// GET single user - Admin only
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Wrap the actual handler logic
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return NextResponse.json(
          createApiError('User not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(createApiResponse({ user }));
    } catch (error) {
      console.error('[Admin Get User] Error:', error);
      return NextResponse.json(
        createApiError('Failed to fetch user'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}

// UPDATE user - Admin only
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      
      const body = await authenticatedReq.json();
      const { email, name, role, isActive, password } = body;
      
      // Validate input
      if (!email || !name) {
        return NextResponse.json(
          createApiError('Missing required fields'),
          { status: 400 }
        );
      }
      
      // Check if email is being changed to one that already exists
      if (email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: id } 
        });
        
        if (existingUser) {
          return NextResponse.json(
            createApiError('Email already in use'),
            { status: 409 }
          );
        }
      }
      
      // Build update object
      const updateData: any = {
        email,
        name,
        role: role || 'customer',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      };
      
      // If password is provided, hash it
      if (password) {
        const salt = await bcrypt.genSalt(12);
        updateData.password = await bcrypt.hash(password, salt);
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return NextResponse.json(
          createApiError('User not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse({ user }, 'User updated successfully')
      );
    } catch (error) {
      console.error('[Admin Update User] Error:', error);
      return NextResponse.json(
        createApiError('Failed to update user'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}

// PATCH user (partial update) - Admin only
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      
      const body = await authenticatedReq.json();
      
      // If email is being changed, check for conflicts
      if (body.email) {
        const existingUser = await User.findOne({ 
          email: body.email, 
          _id: { $ne: id } 
        });
        
        if (existingUser) {
          return NextResponse.json(
            createApiError('Email already in use'),
            { status: 409 }
          );
        }
      }
      
      // If password is provided, hash it
      if (body.password) {
        const salt = await bcrypt.genSalt(12);
        body.password = await bcrypt.hash(body.password, salt);
      }
      
      // Update user with provided fields
      const user = await User.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return NextResponse.json(
          createApiError('User not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse({ user }, 'User updated successfully')
      );
    } catch (error) {
      console.error('[Admin Patch User] Error:', error);
      return NextResponse.json(
        createApiError('Failed to update user'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}

// DELETE user - Admin only
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = requireAdmin()(async (authenticatedReq: NextRequest) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        return NextResponse.json(
          createApiError('User not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createApiResponse(
          { id },
          'User deleted successfully'
        )
      );
    } catch (error) {
      console.error('[Admin Delete User] Error:', error);
      return NextResponse.json(
        createApiError('Failed to delete user'),
        { status: 500 }
      );
    }
  });

  return handler(req);
}