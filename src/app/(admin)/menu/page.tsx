"use client"
import { useState, useEffect } from 'react'

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setItems(data?.data?.items || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createItem(formData: FormData) {
    try {
      const payload = {
        name: String(formData.get('name') || ''),
        price: Number(formData.get('price') || 0),
        category: String(formData.get('category') || ''),
        description: String(formData.get('description') || ''),
        restaurantId: 'default',
        active: true,
        tags: [],
      }
      const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Create failed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Admin: Menu</h1>

      <form action={createItem} className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="grid gap-1">
          <label className="text-sm">Name</label>
          <input className="input" name="name" required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Price</label>
          <input className="input" name="price" type="number" step="0.01" min="0" required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Category</label>
          <input className="input" name="category" required />
        </div>
        <div className="grid gap-1 md:col-span-4">
          <label className="text-sm">Description</label>
          <input className="input" name="description" />
        </div>
        <button className="btn-primary h-10 md:col-span-1">Create</button>
      </form>

      <div className="grid gap-3">
        {loading ? <div>Loading...</div> : null}
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        {items.map(i => (
          <div key={i._id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-sm text-gray-600">${i.price?.toFixed?.(2) || i.price}</div>
            </div>
            <div className="text-sm text-gray-600">{i.category}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
