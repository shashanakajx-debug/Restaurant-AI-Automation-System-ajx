import MenuCard from '@/components/menu/MenuCard'

async function fetchMenu() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/menu`, { cache: 'no-store' })
  const data = await res.json()
  return data?.data?.items || []
}

export default async function MenuPage() {
  const items = await fetchMenu()

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}