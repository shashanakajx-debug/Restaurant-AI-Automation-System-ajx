// components/admin/AdminLayout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
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
    const isActive = (path: string) => {
      return pathname?.startsWith(path);
    };

    const navItems = [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/users", label: "Users", icon: Users },
    ];

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 text-white">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-gray-400 mt-1">{session.user.email}</p>
          </div>
          
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Logged in as <span className="text-white font-medium">{session.user.role}</span>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Fallback - should not reach here due to redirects
  return null;
}