"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect non-admin users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    } else if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/dashboard");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if user is admin
  if (session?.user?.role === "admin") {
    return (
      <div className="flex">
        <aside className="w-64 min-h-screen bg-gray-100 p-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <a href="/admin/dashboard" className="block p-2 hover:bg-gray-200 rounded">Dashboard</a>
            <a href="/admin/menu" className="block p-2 hover:bg-gray-200 rounded">Menu Management</a>
            <a href="/admin/orders" className="block p-2 hover:bg-gray-200 rounded">Orders</a>
            <a href="/admin/analytics" className="block p-2 hover:bg-gray-200 rounded">Analytics</a>
            <a href="/admin/settings" className="block p-2 hover:bg-gray-200 rounded">Settings</a>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    );
  }

  // Fallback - should not reach here due to redirects
  return null;
}