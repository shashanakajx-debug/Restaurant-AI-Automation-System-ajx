import { NextRequest, NextResponse } from "next/server"
import { createReservationSchema, getReservationsSchema } from "@/schemas/reservation"
import dbConnect from "@/lib/mongoose"
import Reservation from "@/models/Reservation"
import { withCorsAuthAndValidation, rateLimits } from "@/middleware"
import { createApiError, createApiResponse } from "@/lib/utils/api"

// Business rules
const BUSINESS_START = 9
const BUSINESS_END = 22 // exclusive
const MAX_RESERVATIONS_PER_SLOT = 10
const MAX_PARTY_SIZE = 50
const RESERVATION_LIMIT = 50

// Helpers
const parseDateToYYYYMMDD = (input: string | undefined | null) => {
  if (!input) return null
  try {
    if (input.includes("T")) {
      const dt = new Date(input)
      if (isNaN(dt.getTime())) return null
      const yyyy = dt.getFullYear()
      const mm = String(dt.getMonth() + 1).padStart(2, "0")
      const dd = String(dt.getDate()).padStart(2, "0")
      return `${yyyy}-${mm}-${dd}`
    } else {
      // assume YYYY-MM-DD
      const parts = input.split("-")
      if (parts.length !== 3) return null
      const dt = new Date(`${input}T00:00:00`)
      if (isNaN(dt.getTime())) return null
      return input
    }
  } catch {
    return null
  }
}

const normalizeTime = (time: string | undefined | null) => {
  if (!time) return null
  const parts = time.split(":")
  if (parts.length < 2) return null
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
}

const isWithinBusinessHours = (time: string) => {
  const [h] = time.split(":").map(Number)
  return !isNaN(h) && h >= BUSINESS_START && h < BUSINESS_END
}

const isValidDateNotPast = (dateStr: string) => {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

const checkAvailability = async (date: string, time: string, restaurantId: string) => {
  try {
    const count = await Reservation.countDocuments({
      date,
      time,
      restaurantId,
      status: { $in: ["pending", "confirmed"] },
    })
    return count < MAX_RESERVATIONS_PER_SLOT
  } catch (err) {
    console.error("[checkAvailability] err", err)
    return false
  }
}

const checkDuplicateBooking = async (email: string, date: string, time: string) => {
  try {
    const existing = await Reservation.findOne({
      "customerInfo.email": email.toLowerCase().trim(),
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    })
    return !!existing
  } catch (err) {
    console.error("[checkDuplicateBooking] err", err)
    return false
  }
}

/**
 * POST — Create reservation
 * Uses withCorsAuthAndValidation(schema) and rateLimits
 */
export const POST = withCorsAuthAndValidation(createReservationSchema, { origin: true, methods: ["POST"], credentials: false })(
  rateLimits.general(async (request: NextRequest) => {
    try {
      await dbConnect()
      // your validation middleware should place validatedData on the request
      // fallback to request.json() if not present
      const data = (request as any).validatedData || (await request.json())

      const rawDate = data.date
      const rawTime = data.time

      const date = parseDateToYYYYMMDD(rawDate)
      const time = normalizeTime(rawTime)

      if (!date) return NextResponse.json(createApiError("Invalid date format"), { status: 400 })
      if (!time) return NextResponse.json(createApiError("Invalid time format"), { status: 400 })

      if (!isValidDateNotPast(date)) {
        return NextResponse.json(createApiError("Cannot book a date in the past"), { status: 400 })
      }

      if (!isWithinBusinessHours(time)) {
        return NextResponse.json(createApiError(`Reservations are only available between ${BUSINESS_START}:00 and ${BUSINESS_END}:00`), { status: 400 })
      }

      if (data.partySize < 1 || data.partySize > MAX_PARTY_SIZE) {
        return NextResponse.json(createApiError(`Party size must be between 1 and ${MAX_PARTY_SIZE} guests`), { status: 400 })
      }

      const email = data.customerInfo?.email?.toLowerCase().trim()
      if (!email) return NextResponse.json(createApiError("Email is required"), { status: 400 })

      const [isAvailable, hasDuplicate] = await Promise.all([
        checkAvailability(date, time, data.restaurantId || "default"),
        checkDuplicateBooking(email, date, time),
      ])

      if (!isAvailable) {
        return NextResponse.json(createApiError("This time slot is fully booked. Please choose another time."), { status: 409 })
      }
      if (hasDuplicate) {
        return NextResponse.json(createApiError("You already have a reservation at this time"), { status: 409 })
      }

      const reservation = await Reservation.create({
        customerInfo: {
          name: data.customerInfo.name,
          email,
          phone: data.customerInfo.phone || undefined,
        },
        partySize: data.partySize,
        date,
        time,
        restaurantId: data.restaurantId || "default",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // TODO: enqueue/send confirmation email
      return NextResponse.json(createApiResponse(reservation, "Reservation created successfully"), { status: 201 })
    } catch (error: any) {
      console.error("[Reservations API] Create error:", error)
      if (error?.code === 11000) {
        return NextResponse.json(createApiError("Duplicate reservation detected"), { status: 409 })
      }
      return NextResponse.json(createApiError("Failed to create reservation. Please try again."), { status: 500 })
    }
  })
)

/**
 * GET — List reservations (optional filters)
 */
export const GET = withCorsAuthAndValidation(getReservationsSchema, { origin: true, methods: ["GET"], credentials: false })(
  rateLimits.general(async (request: NextRequest) => {
    try {
      await dbConnect()
      const { searchParams } = new URL(request.url)
      const email = searchParams.get("email")
      const dateParam = searchParams.get("date")
      const status = searchParams.get("status")

      const query: any = {}
      if (email) query["customerInfo.email"] = email.toLowerCase().trim()
      if (dateParam) {
        const d = parseDateToYYYYMMDD(dateParam)
        if (d) query.date = d
      }
      if (status) query.status = status

      const reservations = await Reservation.find(query).sort({ date: -1, time: -1 }).limit(RESERVATION_LIMIT).lean()
      return NextResponse.json(createApiResponse(reservations, "Reservations retrieved"), { status: 200 })
    } catch (err) {
      console.error("[Reservations API] Get error:", err)
      return NextResponse.json(createApiError("Failed to retrieve reservations"), { status: 500 })
    }
  })
)
