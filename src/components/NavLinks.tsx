"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function NavLinks() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';

  return (
    <nav className="flex items-center gap-4">
      {/* Common links for all users */}
      <Link href="/menu" className="hover:underline">Menu</Link>
      
      {/* Links for authenticated users */}
      {isAuthenticated && (
        <>
          <Link href="/cart" className="hover:underline">Cart</Link>
          <Link href="/reservations" className="hover:underline">Reservations</Link>
          <Link href="/my-orders" className="hover:underline">My Orders</Link>
        </>
      )}
      
      {/* Admin-specific links */}
      {isAdmin && (
        <>
          <Link href="/admin/dashboard" className="hover:underline">Admin Dashboard</Link>
          <Link href="/admin/orders" className="hover:underline">Manage Orders</Link>
          <Link href="/admin/menu" className="hover:underline">Manage Menu</Link>
        </>
      )}
      
      {/* Authentication links */}
      {isAuthenticated ? (
        <>
          <Link href="/profile" className="hover:underline">Profile</Link>
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
    </nav>
  );
}