// src/schemas/reservation.ts
import { z } from "zod"

// Time regex: HH:MM or HH:MM:SS
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/
// Date regex: YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

/**
 * Customer Info Schema
 */
export const customerInfoSchema = z.object({
  name: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Invalid phone number").max(30).optional(),
})

/**
 * Create Reservation Schema
 * - Allows date in 'YYYY-MM-DD' or ISO string
 * - Allows time in 'HH:MM' or 'HH:MM:SS'
 * - Coerces string numbers (like "2") to numbers
 */
export const createReservationSchema = z.object({
  customerInfo: customerInfoSchema,
  partySize: z
    .coerce
    .number()
    .int()
    .min(1, "Minimum 1 guest required")
    .max(50, "Maximum 50 guests allowed"),
  date: z.string().refine((val) => {
    if (!val) return false
    if (val.includes("T")) {
      const parsed = Date.parse(val)
      return !Number.isNaN(parsed)
    }
    return dateRegex.test(val)
  }, { message: "Invalid date format (expected YYYY-MM-DD or ISO string)" }),
  time: z.string().regex(timeRegex, "Invalid time format (expected HH:MM or HH:MM:SS)"),
  restaurantId: z.string().optional(),
})

/**
 * Get Reservations Schema
 * - Used for filtering or query validation
 */
export const getReservationsSchema = z.object({
  email: z.string().email().optional(),
  date: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
})

/**
 * Types for inference
 */
export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type GetReservationsInput = z.infer<typeof getReservationsSchema>
