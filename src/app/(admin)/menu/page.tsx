"use client"
import { useState, useEffect } from 'react'
import { Edit, Trash2, X, Plus } from 'lucide-react'

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
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

  // CREATE
  async function createItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
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
      
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Create failed')
      
      setShowCreateForm(false)
      await load()
      e.currentTarget.reset()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // UPDATE
  async function updateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingItem) return
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const payload = {
        name: String(formData.get('name') || ''),
        price: Number(formData.get('price') || 0),
        category: String(formData.get('category') || ''),
        description: String(formData.get('description') || ''),
        active: formData.get('active') === 'on',
      }
      
      const res = await fetch(`/api/menu/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Update failed')
      
      setEditingItem(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // DELETE
  async function deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Delete failed')
      
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu Management</h1>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New Item</h2>
            <button onClick={() => setShowCreateForm(false)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name *</label>
              <input className="input" name="name" required />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Price *</label>
              <input className="input" name="price" type="number" step="0.01" min="0" required />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category *</label>
              <input className="input" name="category" required />
            </div>
            
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="input" name="description" rows={3} />
            </div>
            
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Create Item</button>
              <button type="button" className="btn" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT FORM */}
      {editingItem && (
        <div className="card p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Edit Item</h2>
            <button onClick={() => setEditingItem(null)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={updateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name *</label>
              <input 
                className="input" 
                name="name" 
                defaultValue={editingItem.name}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Price *</label>
              <input 
                className="input" 
                name="price" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue={editingItem.price}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category *</label>
              <input 
                className="input" 
                name="category"
                defaultValue={editingItem.category}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input 
                  type="checkbox" 
                  name="active"
                  defaultChecked={editingItem.active}
                />
                Active
              </label>
            </div>
            
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="input" 
                name="description" 
                rows={3}
                defaultValue={editingItem.description}
              />
            </div>
            
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Update Item</button>
              <button type="button" className="btn" onClick={() => setEditingItem(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ITEMS LIST */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No menu items found. Create your first item!
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className="card p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{item.name}</div>
                  {!item.active && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  ${item.price?.toFixed?.(2) || item.price} • {item.category}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  className="btn h-9 w-9 p-0 flex items-center justify-center"
                  onClick={() => setEditingItem(item)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn h-9 w-9 p-0 flex items-center justify-center text-red-600 hover:bg-red-50"
                  onClick={() => deleteItem(item._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}