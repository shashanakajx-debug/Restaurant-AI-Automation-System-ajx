// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { useCart } from '@/lib/hooks/useCart'
// import Link from 'next/link'
// import { CheckCircle, ArrowLeft } from 'lucide-react'

// export default function CheckoutSuccessPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { clear } = useCart()
//   const [orderNumber, setOrderNumber] = useState<string>('')
  
//   useEffect(() => {
//     // Clear the cart on successful checkout
//     clear()
    
//     // Generate a random order number for demo purposes
//     // In a real app, this would come from the database
//     const randomOrderId = Math.floor(100000 + Math.random() * 900000).toString()
//     setOrderNumber(randomOrderId)
    
//     // In a real implementation, we would verify the session with Stripe
//     // const sessionId = searchParams.get('session_id')
//     // if (sessionId) {
//     //   // Verify the session with the backend
//     // }
//   }, [clear, searchParams])

//   return (
//     <div className="max-w-lg mx-auto py-12 px-4">
//       <div className="text-center mb-8">
//         <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
//         <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
//         <p className="text-gray-600 mb-4">
//           Thank you for your order. We have received your payment and are preparing your food.
//         </p>
//         <div className="bg-gray-50 p-4 rounded-lg mb-6">
//           <p className="text-sm text-gray-500 mb-1">Order Number</p>
//           <p className="text-xl font-semibold">{orderNumber}</p>
//         </div>
//         <p className="text-sm text-gray-500">
//           A confirmation email has been sent to your email address.
//         </p>
//       </div>
      
//       <div className="flex flex-col gap-3">
//         <Link 
//           href="/menu" 
//           className="btn-primary py-2 px-4 text-center"
//         >
//           Order More Food
//         </Link>
//         <Link 
//           href="/" 
//           className="text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 py-2"
//         >
//           <ArrowLeft size={16} />
//           Return to Home
//         </Link>
//       </div>
//     </div>
//   )
// }