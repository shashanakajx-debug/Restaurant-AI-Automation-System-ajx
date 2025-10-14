"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Clock, ChevronRight } from 'lucide-react'

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const res = await fetch('/api/orders/my-orders')
        
        if (!res.ok) {
          throw new Error('Failed to fetch orders')
        }
        
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load your orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/food-menu" className="btn-primary px-6 py-2">
          Browse Menu
        </Link>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">No orders yet</h1>
        <p className="text-gray-600 mb-6">Start ordering delicious food from our menu</p>
        <Link href="/food-menu" className="btn-primary px-6 py-2">
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link 
            key={order._id} 
            href={`/my-orders/${order._id}`}
            className="card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Order #{order._id.slice(-6)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <Clock size={14} className="inline mr-1" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">${order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{order.items.length} items</div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}