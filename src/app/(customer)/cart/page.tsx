"use client"
import { useCart } from '@/lib/hooks/useCart'
import Link from 'next/link'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, subtotal } = useCart()

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty. <Link href="/menu" className="underline">Browse menu</Link></p>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-3">
            {items.map((item: any) => (
              <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn h-8 px-2 border" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button className="btn h-8 px-2 border" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn h-8 px-3 border" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Subtotal: ${subtotal().toFixed(2)}</div>
            <div className="flex items-center gap-2">
              <button className="btn h-10 px-4 border" onClick={clear}>Clear</button>
              <Link href="/checkout" className="btn-primary h-10 px-5">Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
