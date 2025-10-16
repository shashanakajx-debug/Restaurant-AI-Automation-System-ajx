// src/app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(createApiError('Token is required'), { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(createApiError('Invalid or expired reset token'), { status: 400 });
    }

    return NextResponse.json(createApiResponse(null, 'Token is valid'), { status: 200 });
  } catch (error) {
    console.error('Token verification (GET) error:', error);
    return NextResponse.json(createApiError('An unexpected error occurred'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;
    const password = body?.password;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(createApiError('Token is required'), { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(createApiError('Password must be at least 8 characters'), { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(createApiError('Invalid or expired reset token'), { status: 400 });
    }

    // Hash password (bcryptjs)
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    // clear token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json(createApiResponse(null, 'Password reset successful'), { status: 200 });
  } catch (error) {
    console.error('Password reset (POST) error:', error);
    return NextResponse.json(createApiError('An unexpected error occurred'), { status: 500 });
  }
}
