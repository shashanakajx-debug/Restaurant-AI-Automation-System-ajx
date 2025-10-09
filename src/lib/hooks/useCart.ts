import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: (item: CartItem) => set((state: CartState) => {
        const existing = state.items.find(i => i.id === item.id)
        if (existing) {
          return {
            items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
          }
        }
        return { items: [...state.items, item] }
      }),
      removeItem: (id: string) => set((state: CartState) => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id: string, quantity: number) => set((state: CartState) => ({
        items: state.items
          .map(i => i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i)
          .filter(i => i.quantity > 0)
      })),
      clear: () => set({ items: [] }),
      subtotal: () => (get() as CartState).items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }) as CartState,
    { name: 'restaurant_cart' }
  )
)
