import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        createApiError('Email is required'),
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not for security
    if (!user) {
      // We still return success to prevent email enumeration attacks
      return NextResponse.json(
        createApiResponse(null, 'If your email exists in our system, you will receive a password reset link'),
        { status: 200 }
      );
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    if (!emailSent) {
      return NextResponse.json(
        createApiError('Failed to send reset email'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiResponse(null, 'If your email exists in our system, you will receive a password reset link'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      createApiError('An unexpected error occurred'),
      { status: 500 }
    );
  }
}