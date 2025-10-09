import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Reservation from '@/models/Reservation'
import { createReservationSchema } from '@/schemas/reservation'
import { withCorsAuthAndValidation, rateLimits } from '@/middleware'
import { createApiError, createApiResponse } from '@/lib/utils/api'

export const POST = withCorsAuthAndValidation(
  createReservationSchema,
  { origin: true, methods: ['POST'], credentials: false }
)(
  rateLimits.general(async (request) => {
    try {
      await dbConnect()
      const data = (request as any).validatedData!

      const reservation = await Reservation.create({
        ...data,
        status: 'pending',
      })

      return NextResponse.json(createApiResponse(reservation, 'Reservation created'), { status: 201 })
    } catch (error) {
      console.error('[Reservations API] Create error:', error)
      return NextResponse.json(createApiError('Failed to create reservation'), { status: 500 })
    }
  })
)
