"use client"
import { useCart } from '@/lib/hooks/useCart'
import Image from 'next/image'
import { Leaf, Wheat, Flame, ShoppingCart } from 'lucide-react'

type MenuItem = {
  _id: string
  name: string
  description?: string
  price: number
  category: string
  tags?: string[]
  imageUrl?: string
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  spiceLevel?: number
}

export default function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart()
  
  const handleAddToCart = () => {
    addItem({ 
      id: item._id, 
      name: item.name, 
      price: item.price, 
      quantity: 1, 
      imageUrl: item.imageUrl 
    })
  }
  
  return (
    <div className="card p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow rounded-lg border border-gray-100">
      {item.imageUrl ? (
        <div className="relative h-48 mb-3 rounded-md overflow-hidden">
          <Image 
            src={item.imageUrl} 
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-48 mb-3 bg-gray-100 rounded-md flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-lg">{item.name}</h3>
          <span className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</span>
        </div>
        
        {/* Dietary indicators */}
        <div className="flex gap-2 mt-1">
          {item.isVegetarian && (
            <span title="Vegetarian" className="text-green-600">
              <Leaf size={16} />
            </span>
          )}
          {item.isGlutenFree && (
            <span title="Gluten Free" className="text-amber-600">
              <Wheat size={16} />
            </span>
          )}
          {item.spiceLevel && item.spiceLevel > 0 && (
            <span title={`Spice Level: ${item.spiceLevel}/5`} className="text-red-500 flex items-center">
              <Flame size={16} />
              {item.spiceLevel > 2 && <Flame size={12} className="ml-0.5" />}
              {item.spiceLevel > 4 && <Flame size={12} className="ml-0.5" />}
            </span>
          )}
        </div>
        
        {item.description ? (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
        ) : null}
        
        {item.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((t: string) => (
              <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        ) : null}
      </div>
      
      <button
        className="btn-primary mt-4 h-10 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors rounded-md"
        onClick={handleAddToCart}
      >
        <ShoppingCart size={18} />
        Add to cart
      </button>
    </div>
  )
}
