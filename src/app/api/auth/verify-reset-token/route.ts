// src/app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { createApiResponse, createApiError } from '@/lib/utils/api'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token)
      return NextResponse.json(createApiError('Token is required'), {
        status: 400,
      })

    await dbConnect()

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    })
    if (!user)
      return NextResponse.json(
        createApiError('Invalid or expired reset token'),
        { status: 400 }
      )

    return NextResponse.json(createApiResponse(null, 'Token is valid'), {
      status: 200,
    })
  } catch (err) {
    console.error('Token verification (GET) error:', err)
    return NextResponse.json(createApiError('Unexpected error'), {
      status: 500,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { token, password } = body

    if (!token || typeof token !== 'string')
      return NextResponse.json(createApiError('Token is required'), {
        status: 400,
      })
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        createApiError('Password must be at least 8 characters'),
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    })
    if (!user)
      return NextResponse.json(
        createApiError('Invalid or expired reset token'),
        { status: 400 }
      )

    // Assign plain password, pre-save hook will hash
    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined

    await user.save()

    return NextResponse.json(
      createApiResponse(null, 'Password reset successful'),
      { status: 200 }
    )
  } catch (err) {
    console.error('Password reset (POST) error:', err)
    return NextResponse.json(createApiError('Unexpected error'), {
      status: 500,
    })
  }
}
