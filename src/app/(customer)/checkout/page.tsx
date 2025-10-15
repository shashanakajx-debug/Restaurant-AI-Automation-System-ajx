// "use client"
// import { useCart } from '@/lib/hooks/useCart'
// import { useState } from 'react'

// export default function CheckoutPage() {
//   const { items, clear, subtotal } = useCart()
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState<string | null>(null)

//   async function submitOrder(formData: FormData) {
//     setLoading(true)
//     setMessage(null)
//     try {
//       const customerInfo = {
//         name: String(formData.get('name') || ''),
//         email: String(formData.get('email') || ''),
//         phone: String(formData.get('phone') || ''),
//       }
//       const payload = {
//         customerInfo,
//         items: items.map((i: any) => ({ menuItemId: i.id, quantity: i.quantity })),
//         paymentMethod: 'card',
//       }
//       const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data?.error || 'Order failed')
//       clear()
//       setMessage('Order placed successfully!')
//     } catch (e: any) {
//       setMessage(e.message || 'Something went wrong')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="grid gap-6 max-w-2xl">
//       <h1 className="text-2xl font-semibold">Checkout</h1>
//       <form action={submitOrder} className="grid gap-4">
//         <div className="grid gap-2">
//           <label className="text-sm">Name</label>
//           <input name="name" className="input" required />
//         </div>
//         <div className="grid gap-2">
//           <label className="text-sm">Email</label>
//           <input name="email" type="email" className="input" required />
//         </div>
//         <div className="grid gap-2">
//           <label className="text-sm">Phone</label>
//           <input name="phone" className="input" />
//         </div>
//         <div className="grid gap-2 p-4 card">
//           <div className="font-medium">Summary</div>
//           <div className="text-sm text-gray-600">Items: {items.length}</div>
//           <div className="text-sm text-gray-600">Subtotal: ${subtotal().toFixed(2)}</div>
//         </div>
//         <button disabled={loading} className="btn-primary h-10">
//           {loading ? 'Placing order...' : 'Place order'}
//         </button>
//         {message ? <p className="text-sm text-gray-700">{message}</p> : null}
//       </form>
//     </div>
//   )
// }
