async function fetchOrders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/orders`, { cache: 'no-store' })
  const data = await res.json()
  return data?.data?.orders || []
}

export default async function AdminOrdersPage() {
  const orders = await fetchOrders()
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Admin: Orders</h1>
      <div className="grid gap-3">
        {orders.map((o: any) => (
          <div key={o._id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Order #{o._id?.slice?.(-6)}</div>
              <div className="text-sm">{o.status}</div>
            </div>
            <div className="text-sm text-gray-600">{o.customerInfo?.name} • ${o.total?.toFixed?.(2) || o.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
