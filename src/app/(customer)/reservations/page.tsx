"use client"

import React, { useRef, useState, useCallback } from "react"

type ReservationDetails = {
  _id?: string
  id?: string
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  partySize: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  status: string
}

type Message = { type: "success" | "error"; text: string } | null

const BUSINESS_START = 9
const BUSINESS_END = 22 // exclusive

export default function ReservationsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message>(null)
  const [confirmation, setConfirmation] = useState<ReservationDetails | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = today.toISOString().split("T")[0] // YYYY-MM-DD

  const validateForm = useCallback((date: string, time: string): Message | null => {
    if (!date) return { type: "error", text: "Please select a date" }
    if (!time) return { type: "error", text: "Please select a time" }

    // date check (YYYY-MM-DD)
    const reservationDate = new Date(date)
    reservationDate.setHours(0, 0, 0, 0)
    if (reservationDate < today) {
      return { type: "error", text: "Cannot book a date in the past." }
    }

    const [hours, minutes] = time.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return { type: "error", text: "Invalid time format." }
    }

    if (hours < BUSINESS_START || hours >= BUSINESS_END) {
      return { type: "error", text: `Please select a time between ${BUSINESS_START}:00 and ${BUSINESS_END}:00.` }
    }

    return null
  }, [])

  const createReservation = useCallback(async (formData: FormData) => {
    setLoading(true)
    setMessage(null)
    setConfirmation(null)

    const name = String(formData.get("name") || "").trim()
    const email = String(formData.get("email") || "").trim().toLowerCase()
    const phone = String(formData.get("phone") || "").trim()
    const partySize = Number(formData.get("partySize") || 2)
    const date = String(formData.get("date") || "")
    const time = String(formData.get("time") || "")

    const validationError = validateForm(date, time)
    if (validationError) {
      setMessage(validationError)
      setLoading(false)
      return
    }

    try {
      const payload = {
        customerInfo: {
          name,
          email,
          ...(phone ? { phone } : {}),
        },
        partySize,
        date, // YYYY-MM-DD
        time, // HH:MM
        restaurantId: "default",
      }

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const serverMsg = data?.error || data?.message || "Reservation failed. Please try again."
        throw new Error(serverMsg)
      }

      const reservation = (data && (data.data || data)) as ReservationDetails
      setMessage({ type: "success", text: "Reservation confirmed! Check your email for details." })
      setConfirmation(reservation)
      formRef.current?.reset()
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }, [validateForm])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createReservation(formData)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const [hoursStr, minutes] = timeStr.split(":")
      const hour = parseInt(hoursStr, 10)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeStr
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Reserve Your Table</h1>
          <p className="text-gray-700 text-sm sm:text-base">Book your dining experience with us — quick, secure, and flexible.</p>
        </header>

   <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-start max-w-6xl mx-auto">
  <section className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 border border-gray-100">
    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8">
      Reservation Details
    </h2>

    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-5 sm:space-y-6"
      aria-live="polite"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Ajx Technologies"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="ajx-technologies@gmail.com"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="+91 1234567890"
        />
      </div>

      {/*  Date and Time Fields with More Gap */}
      <div className="grid grid-cols-2 gap-6 sm:gap-8">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            min={minDate}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Time <span className="text-red-500">*</span>
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="partySize"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Number of Guests <span className="text-red-500">*</span>
        </label>
        <select
          id="partySize"
          name="partySize"
          defaultValue={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
          <option value={15}>15+ Guests (Large Party)</option>
          <option value={20}>20+ Guests (Event)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3.5 rounded-lg disabled:opacity-60"
      >
        {loading ? "Processing..." : "Confirm Reservation"}
      </button>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
          role="alert"
        >
          <div>
            <p
              className={`text-sm font-medium ${
                message.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}
    </form>

    <footer className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-1">💡 Business Hours:</p>
      <p className="text-sm text-gray-700">
        Monday - Sunday: 9:00 AM - 10:00 PM
      </p>
    </footer>
  </section>


          <aside className="space-y-6">
            {confirmation ? (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 mx-auto">
                  <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">Reservation Confirmed!</h3>
                <p className="text-center text-emerald-100 mb-6">We look forward to serving you</p>

                <dl className="space-y-3 bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <dt className="text-emerald-100 text-sm">Guest Name</dt>
                    <dd className="font-semibold text-white truncate max-w-[50%]">{confirmation.customerInfo.name}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <dt className="text-emerald-100 text-sm">Date</dt>
                    <dd className="font-semibold text-white text-right">{formatDate(confirmation.date)}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <dt className="text-emerald-100 text-sm">Time</dt>
                    <dd className="font-semibold text-white">{formatTime(confirmation.time)}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <dt className="text-emerald-100 text-sm">Party Size</dt>
                    <dd className="font-semibold text-white">{confirmation.partySize} Guests</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-emerald-100 text-sm">Status</dt>
                    <dd className="px-3 py-1 bg-white text-emerald-700 rounded-full text-sm font-semibold uppercase">
                      {confirmation.status}
                    </dd>
                  </div>
                </dl>

                <p className="text-center text-sm text-emerald-100 mt-6">
                  A confirmation email has been sent to <br />
                  <span className="font-semibold break-all">{confirmation.customerInfo.email}</span>
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Reserve With Us?</h3>
                <ul className="space-y-4">
                  {[
                    { title: "Instant Confirmation", desc: "Receive immediate booking confirmation via email" },
                    { title: "Priority Seating", desc: "Reserved tables ready when you arrive" },
                    { title: "Easy Modifications", desc: "Flexible cancellation and rescheduling" }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">For parties larger than 20 guests or special requests, contact us directly.</p>
              <address className="not-italic space-y-2 text-sm">
                <p className="text-gray-700">📞 Phone: <a href="tel:+911234567890" className="hover:underline">+91 1234567890</a></p>
                <p className="text-gray-700">📧 Email: <a href="mailto:ajx123@gmail.com" className="hover:underline">ajx123@gmail.com</a></p>
              </address>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
