"use client"
import { useState } from 'react'

export default function ReservationsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function createReservation(formData: FormData) {
    setLoading(true)
    setMessage(null)
    try {
      const payload = {
        customerInfo: {
          name: String(formData.get('name') || ''),
          email: String(formData.get('email') || ''),
          phone: String(formData.get('phone') || ''),
        },
        partySize: Number(formData.get('partySize') || 2),
        date: String(formData.get('date') || ''),
        time: String(formData.get('time') || ''),
        restaurantId: 'default',
      }
      const res = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Reservation failed')
      setMessage('Reservation request submitted!')
    } catch (e: any) {
      setMessage(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Reservations</h1>
      <form action={createReservation} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input name="name" className="input" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Email</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Phone</label>
          <input name="phone" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm">Date</label>
            <input name="date" type="date" className="input" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Time</label>
            <input name="time" type="time" className="input" required />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Party Size</label>
          <input name="partySize" type="number" className="input" defaultValue={2} min={1} max={20} />
        </div>
        <button disabled={loading} className="btn-primary h-10">
          {loading ? 'Submitting...' : 'Submit reservation'}
        </button>
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}
      </form>
    </div>
  )
}
