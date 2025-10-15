async function fetchDashboard() {
  const [ordersRes, menuRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/orders?limit=1`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/menu?limit=1`, { cache: 'no-store' }),
  ])
  return {
    ordersOk: ordersRes.ok,
    menuOk: menuRes.ok,
  }
}

export default async function ManagementDashboardPage() {
  const data = await fetchDashboard()
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Management Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600">Orders API</div>
          <div className="text-xl font-semibold">{data.ordersOk ? 'OK' : 'Error'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600">Menu API</div>
          <div className="text-xl font-semibold">{data.menuOk ? 'OK' : 'Error'}</div>
        </div>
      </div>
    </div>
  )
}
