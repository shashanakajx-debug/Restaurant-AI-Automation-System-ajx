"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";


export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Only render for admin users
  if (session?.user?.role !== "admin") {
    return null;
  }
  
  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? "bg-gray-200" : "";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-gray-600">{session.user.email}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <Link href="/admin/dashboard" className={`block p-2 rounded ${isActive("/admin/dashboard")}`}>
          Dashboard
        </Link>
        <Link href="/admin/menu" className={`block p-2 rounded ${isActive("/admin/menu")}`}>
          Menu Management
        </Link>
        <Link href="/admin/orders" className={`block p-2 rounded ${isActive("/admin/orders")}`}>
          Orders
        </Link>
      </nav>
      
      <div className="p-4 border-t">

      </div>
    </div>
  );
}