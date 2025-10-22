"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `hover:underline ${pathname === href ? 'font-semibold underline' : ''}`;

  return (
    <nav className="flex items-center gap-4">
      {/* Common links for all users */}
      <Link href="/food-menu" className={linkClass('/food-menu')}>Menu</Link>
      
      {/* Links for authenticated users */}
      {isAuthenticated && (
        <>
          <Link href="/reservations" className={linkClass('/reservations')}>Reservations</Link>
          <Link href="/my-orders" className={linkClass('/my-orders')}>My Orders</Link>
        </>
      )}
      
      {/* Admin-specific links */}
      {isAdmin && (
        <>
          <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>Admin Dashboard</Link>
          <Link href="/admin/orders" className={linkClass('/admin/orders')}>Manage Orders</Link>
          <Link href="/admin/menu" className={linkClass('/admin/menu')}>Manage Menu</Link>
        </>
      )}
      
      {/* Authentication links */}
      {isAuthenticated ? (
        <>
          <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="hover:underline cursor-pointer"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link href="/login" className="
text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Sign In</Link>
      )}

      {/* Cart icon */}
      <Link href="/cart" className="relative inline-flex items-center justify-center">
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </Link>
    </nav>
  );
}