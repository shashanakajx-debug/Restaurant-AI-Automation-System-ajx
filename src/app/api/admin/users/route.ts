import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import { withAuth } from '@/middleware/auth';

// Get all users - Admin only
export const GET = withAuth(async (req: NextRequest) => {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (role) query.role = role;
    
    // Execute query
    const users = await User.find(query)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(query);
    
    return NextResponse.json(createApiResponse({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    return NextResponse.json(createApiError('Failed to fetch users'), { status: 500 });
  }
}, { requiredRole: 'admin' });

// Create a new admin user - Admin only
export const POST = withAuth(async (req: NextRequest) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email, name, password, role = 'admin' } = body;
    
    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(createApiError('Missing required fields'), { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(createApiError('User already exists'), { status: 409 });
    }
    
    // Create new admin user
    const user = await User.create({
      email,
      name,
      password, // Will be hashed by the User model pre-save hook
      role,
      isActive: true,
      emailVerified: true
    });
    
    return NextResponse.json(createApiResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, 'Admin user created successfully'), { status: 201 });
  } catch (error) {
    console.error('[Admin Create User] Error:', error);
    return NextResponse.json(createApiError('Failed to create user'), { status: 500 });
  }
}, { requiredRole: 'admin' });