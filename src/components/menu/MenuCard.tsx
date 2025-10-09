"use client"
import { useCart } from '@/lib/hooks/useCart'

export default function MenuCard({ item }: { item: any }) {
  const add = useCart((s: any) => s.addItem)
  return (
    <div className="card p-4 flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-lg">{item.name}</h3>
          <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
        </div>
        {item.description ? (
          <p className="mt-2 text-sm text-gray-600">{item.description}</p>
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
        className="btn-primary mt-4 h-10"
        onClick={() => add({ id: item._id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl })}
      >
        Add to cart
      </button>
    </div>
  )
}
