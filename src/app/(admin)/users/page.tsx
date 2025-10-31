"use client"
import { useState, useEffect } from 'react'
import { Edit, Trash2, X, Plus, User, Shield, UserX } from 'lucide-react'

const ROLES = [
  { value: 'customer', label: 'Customer', icon: User },
  { value: 'admin', label: 'Admin', icon: Shield },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  async function loadUsers(role?: string) {
    setLoading(true)
    setError(null)
    try {
      const url = role ? `/api/admin?role=${role}` : '/api/admin'
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users')
      
      setUsers(data?.data?.users || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(roleFilter || undefined)
  }, [roleFilter])

  // CREATE
  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const payload = {
        email: String(formData.get('email') || ''),
        name: String(formData.get('name') || ''),
        password: String(formData.get('password') || ''),
        role: String(formData.get('role') || 'customer'),
      }
      
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Create failed')
      }
      
      setShowCreateForm(false)
      await loadUsers(roleFilter || undefined)
      e.currentTarget.reset()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // UPDATE
  async function updateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingUser) return
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const payload: any = {
        email: String(formData.get('email') || ''),
        name: String(formData.get('name') || ''),
        role: String(formData.get('role') || 'customer'),
        isActive: formData.get('isActive') === 'on',
      }
      
      const password = String(formData.get('password') || '')
      if (password) {
        payload.password = password
      }
      
      const res = await fetch(`/api/admin/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      
      setEditingUser(null)
      await loadUsers(roleFilter || undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }

  // DELETE
  async function deleteUser(id: string, email: string) {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) return
    
    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      
      await loadUsers(roleFilter || undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }

  function getRoleColor(role: string) {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'customer': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getRoleIcon(role: string) {
    const roleObj = ROLES.find(r => r.value === role)
    const Icon = roleObj?.icon || User
    return <Icon size={16} />
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <button 
              className={`btn h-9 px-3 ${!roleFilter ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => setRoleFilter(null)}
            >
              All
            </button>
            {ROLES.map(role => (
              <button 
                key={role.value}
                className={`btn h-9 px-3 ${roleFilter === role.value ? getRoleColor(role.value) : ''}`}
                onClick={() => setRoleFilter(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New User</h2>
            <button onClick={() => setShowCreateForm(false)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name *</label>
              <input className="input" name="name" required />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email *</label>
              <input className="input" name="email" type="email" required />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password *</label>
              <input className="input" name="password" type="password" required minLength={6} />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role *</label>
              <select className="input" name="role" required>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Create User</button>
              <button type="button" className="btn" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT FORM */}
      {editingUser && (
        <div className="card p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <button onClick={() => setEditingUser(null)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={updateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name *</label>
              <input 
                className="input" 
                name="name" 
                defaultValue={editingUser.name}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email *</label>
              <input 
                className="input" 
                name="email" 
                type="email"
                defaultValue={editingUser.email}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password (leave blank to keep current)</label>
              <input className="input" name="password" type="password" minLength={6} />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role *</label>
              <select 
                className="input" 
                name="role" 
                defaultValue={editingUser.role}
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input 
                  type="checkbox" 
                  name="isActive"
                  defaultChecked={editingUser.isActive}
                />
                Active Account
              </label>
            </div>
            
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Update User</button>
              <button type="button" className="btn" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USERS LIST */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found. {roleFilter && 'Try changing the filter.'}
          </div>
        ) : (
          users.map(user => (
            <div key={user._id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} flex items-center justify-center flex-shrink-0`}>
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{user.name}</div>
                    {!user.isActive && (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        <UserX size={12} />
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                  {ROLES.find(r => r.value === user.role)?.label || user.role}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  className="btn h-9 w-9 p-0 flex items-center justify-center"
                  onClick={() => setEditingUser(user)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn h-9 w-9 p-0 flex items-center justify-center text-red-600 hover:bg-red-50"
                  onClick={() => deleteUser(user._id, user.email)}
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