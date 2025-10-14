"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PlusCircle, Edit, Trash2, Check, X, ImagePlus, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  'Appetizers', 'Main Courses', 'Sides', 'Desserts', 'Beverages', 
  'Breakfast', 'Lunch', 'Dinner', 'Specials', 'Vegan', 'Vegetarian'
]

const SPICE_LEVELS = [
  { value: 0, label: 'Not Spicy' },
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hot' },
  { value: 4, label: 'Extra Hot' }
]

export default function AdminMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentRole = (session as any)?.user?.role || 'guest';
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Courses',
    description: '',
    imageUrl: '',
    spiceLevel: 0,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isPopular: false,
    active: true
  })

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && currentRole !== 'admin')) {
      router.push('/login');
    }
  }, [status, currentRole, router]);

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/menu', { credentials: 'include' })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = data?.error || data?.message || (data?.details ? JSON.stringify(data.details) : 'Failed to load menu')
        setError(msg)
        setItems([])
      } else {
        setItems(data?.data?.items || [])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setFormData({
      name: '',
      price: '',
      category: 'Main Courses',
      description: '',
      imageUrl: '',
      spiceLevel: 0,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isPopular: false,
      active: true
    })
    setEditingItem(null)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as HTMLInputElement
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    try {
      const priceValue = parseFloat(formData.price);
      if (Number.isNaN(priceValue)) {
        throw new Error('Please provide a valid price');
      }

      const payload = {
        ...formData,
        price: priceValue,
        spiceLevel: parseInt(formData.spiceLevel.toString()),
        restaurantId: 'default',
        tags: [] as string[],
      };
      
      if (editingItem) {
        // Update existing item
        const res = await fetch(`/api/menu/${editingItem._id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload),
          credentials: 'include',
        })
        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          const msg = errorBody?.error || errorBody?.message || (errorBody?.details ? JSON.stringify(errorBody.details) : 'Update failed');
          throw new Error(msg);
        }
      } else {
        // Create new item
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          const msg = errorBody?.error || errorBody?.message || (errorBody?.details ? JSON.stringify(errorBody.details) : 'Create failed');
          throw new Error(msg);
        }
      }
      
      await load()
      resetForm()
      setShowForm(false)
    } catch (e: any) {
      setError(e.message)
    }
  }

  function handleEdit(item: any) {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      price: item.price?.toString() || '',
      category: item.category || 'Main Courses',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      spiceLevel: item.spiceLevel || 0,
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      isGlutenFree: item.isGlutenFree || false,
      isPopular: item.isPopular || false,
      active: item.active !== false
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const msg = errorBody?.error || errorBody?.message || (errorBody?.details ? JSON.stringify(errorBody.details) : 'Delete failed');
        throw new Error(msg);
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      // Server exposes PUT for updates; use PUT to toggle active flag
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const msg = errorBody?.error || errorBody?.message || 'Update failed';
        throw new Error(msg);
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu Management</h1>
        {currentRole === 'admin' ? (
          <button 
            className="btn-primary h-10 px-4 flex items-center gap-2"
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
          >
            <PlusCircle size={18} />
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        ) : (
          <div className="text-sm text-gray-600">Signed in as <strong>{currentRole}</strong>. Admin actions are disabled.</div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

          {showForm && currentRole === 'admin' && (
        <form onSubmit={handleSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 border-b pb-2 mb-2">
            <h2 className="text-lg font-medium">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Name*</label>
            <input 
              className="input" 
              name="name" 
              value={formData.name}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Price*</label>
            <input 
              className="input" 
              name="price" 
              type="number" 
              step="0.01" 
              min="0" 
              value={formData.price}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Category*</label>
            <select 
              className="input" 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Image URL</label>
            <div className="flex gap-2">
              <input 
                className="input flex-1" 
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                {formData.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      fill 
                      className="object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Error'
                      }}
                    />
                  </div>
                ) : (
                  <ImagePlus size={20} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="grid gap-1 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="input min-h-[80px]" 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Spice Level</label>
            <select 
              className="input" 
              name="spiceLevel"
              value={formData.spiceLevel}
              onChange={handleInputChange}
            >
              {SPICE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-3 content-start">
            <label className="text-sm font-medium">Dietary Options</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleInputChange}
                />
                <span>Vegetarian</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isVegan"
                  checked={formData.isVegan}
                  onChange={handleInputChange}
                />
                <span>Vegan</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onChange={handleInputChange}
                />
                <span>Gluten Free</span>
              </label>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-wrap gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleInputChange}
              />
              <span>Mark as Popular</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              <span>Active (visible to customers)</span>
            </label>
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <button 
              type="button"
              className="btn h-10 px-4"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary h-10 px-6"
            >
              {editingItem ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No menu items found. Add your first item to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 relative">
                          {item.imageUrl ? (
                            <Image 
                              src={item.imageUrl} 
                              alt={item.name} 
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Error'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.isPopular && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Popular</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{item.category}</td>
                    <td className="p-3 font-medium">${item.price?.toFixed?.(2) || item.price}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentRole === 'admin' ? (
                          <>
                            <button 
                              className="p-1 text-gray-500 hover:text-gray-700"
                              onClick={() => handleToggleActive(item._id, item.active)}
                              title={item.active ? 'Deactivate' : 'Activate'}
                            >
                              {item.active ? <X size={18} /> : <Check size={18} />}
                            </button>
                            <button 
                              className="p-1 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(item._id)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">No actions</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
