'use client'  // This marks the component as a Client Component

import { useEffect, useState } from 'react'
import MenuCard from '@/components/menu/MenuCard'
import { getApiUrl } from '@/lib/utils/url'

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
  tags: string[]
  active: boolean
  description: string
  imageUrl: string
  isGlutenFree: boolean
  isPopular: boolean
  isVegan: boolean
  isVegetarian: boolean
  spiceLevel: number
}

async function fetchMenu() {
  try {
    const url = getApiUrl('/api/menu');
    console.log('Requesting URL:', url);  // Log the URL

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch menu items. Status: ${res.status}`);
    }

    const responseData = await res.json();
    return responseData?.data?.items || [];
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];  // Return an empty array if something goes wrong
  }
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const fetchedItems = await fetchMenu()
        setItems(fetchedItems)
      } catch (err: any) {
        setError('Failed to load menu items.')
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  if (loading) return <p className="text-center">Loading menu...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-500">No menu items available.</p>
        ) : (
          items.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}
