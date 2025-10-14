"use client"
import { useState } from 'react'
import { useCart } from '@/lib/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, subtotal } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty. Please add items before checkout.')
      return
    }
    
    setError(null)
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
          metadata: {
            orderType: 'delivery'
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError('There was a problem processing your checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some delicious items from our menu</p>
        <Link href="/food-menu" className="btn-primary px-6 py-2">
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <Link href="/food-menu" className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>
        
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="text-right w-20 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          <button 
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 justify-center py-2"
            onClick={clear}
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>
      </div>
      
      <div className="md:col-span-1">
        <div className="card p-4 sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="grid gap-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${(subtotal() * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>$3.99</span>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${(subtotal() * 1.08 + 3.99).toFixed(2)}</span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <button 
            className="btn-primary w-full h-10 flex items-center justify-center"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Proceed to Checkout'
            )}
          </button>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Secure checkout powered by Stripe
          </div>
          <div className="mt-4 text-sm text-center">
            <Link href="/my-orders" className="text-primary hover:underline">
              View my orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
