"use client"

import { useState, useEffect } from 'react'
import { Clock, Package, Check, X, ChevronDown, ChevronUp, Phone, MapPin, AlertCircle, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready', label: 'Ready', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  async function fetchOrders(status?: string) {
    setLoading(true)
    setError(null)
    try {
      const url = status 
        ? `/api/orders?status=${status}` 
        : '/api/orders'
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')
      
      setOrders(data.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(activeFilter || undefined)
  }, [activeFilter])

  // UPDATE order status
  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to update order')
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ))
    } catch (e: any) {
      setError(e.message)
    }
  }

  // DELETE order
  async function deleteOrder(orderId: string) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to delete order')
      
      setOrders(orders.filter(order => order._id !== orderId))
    } catch (e: any) {
      setError(e.message)
    }
  }

  function toggleOrderExpanded(orderId: string) {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  function getStatusColor(status: string) {
    const statusObj = ORDER_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  function getStatusIcon(status: string) {
    switch(status) {
      case 'pending': return <Clock size={16} />
      case 'preparing': return <Package size={16} />
      case 'ready': return <Check size={16} />
      case 'delivered': return <Check size={16} />
      case 'cancelled': return <X size={16} />
      default: return <Clock size={16} />
    }
  }

  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button 
            className={`btn h-9 px-3 text-sm ${!activeFilter ? 'bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            All
          </button>
          {ORDER_STATUSES.map(status => (
            <button 
              key={status.value}
              className={`btn h-9 px-3 text-sm ${activeFilter === status.value ? status.color : ''}`}
              onClick={() => setActiveFilter(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found. {activeFilter && 'Try changing the filter.'}
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="card overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderExpanded(order._id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getStatusColor(order.status)} flex items-center justify-center flex-shrink-0`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="font-medium">Order #{order._id?.slice?.(-6)}</div>
                    <div className="text-sm text-gray-600">
                      {order.customerInfo?.name} • ${order.total?.toFixed?.(2) || order.total}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                  </div>
                  {expandedOrders[order._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {expandedOrders[order._id] && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Order Items</h3>
                      <div className="grid gap-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <span className="font-medium">{item.quantity}x</span> {item.name}
                              {item.specialInstructions && (
                                <div className="text-xs text-gray-600 ml-5">Note: {item.specialInstructions}</div>
                              )}
                            </div>
                            <div>${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax</span>
                          <span>${order.tax?.toFixed(2)}</span>
                        </div>
                        {order.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee</span>
                            <span>${order.deliveryFee?.toFixed(2)}</span>
                          </div>
                        )}
                        {order.tip > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Tip</span>
                            <span>${order.tip?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                          <span>Total</span>
                          <span>${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Customer Information</h3>
                      <div className="grid gap-2 text-sm">
                        <div>Name: {order.customerInfo?.name}</div>
                        <div>Email: {order.customerInfo?.email}</div>
                        {order.customerInfo?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {order.customerInfo.phone}
                          </div>
                        )}
                      </div>
                      
                      {order.deliveryAddress && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Delivery Address</h3>
                          <div className="flex items-start gap-1 text-sm">
                            <MapPin size={14} className="mt-1 flex-shrink-0" />
                            <div>
                              {order.deliveryAddress.street}<br />
                              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {order.specialInstructions && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Special Instructions</h3>
                          <div className="text-sm bg-yellow-50 p-2 rounded">
                            {order.specialInstructions}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Update Status</h3>
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.map(status => (
                            <button
                              key={status.value}
                              className={`btn h-9 px-3 text-sm ${order.status === status.value ? status.color : ''}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order._id, status.value)
                              }}
                              disabled={order.status === status.value}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t">
                        <button
                          className="btn text-red-600 hover:bg-red-50 flex items-center gap-2 w-full justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteOrder(order._id)
                          }}
                        >
                          <Trash2 size={16} />
                          Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}