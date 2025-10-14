import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        createApiError('Token is required'),
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by reset token
    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) {
      return NextResponse.json(
        createApiError('Invalid or expired reset token'),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createApiResponse(null, 'Token is valid'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      createApiError('An unexpected error occurred'),
      { status: 500 }
    );
  }
}