"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import SignOutButton from "./signoutbutton";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AuthNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Handle session state changes
  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  // If session is loading, show a loading state
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a spinner or better UI
  }

  const isAuthenticated = status === "authenticated";
  const isAdmin = isAuthenticated && session?.user?.role === "admin";

  // Handle Menu click to check if the user is authenticated
  const handleMenuClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Prevent default navigation
      console.log("Redirecting to Login...");
      router.push("/login"); // Redirect to login page if not authenticated
    }
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Menu link */}
      <Link
        href="/menu"
        className="hover:underline"
        onClick={handleMenuClick} // Menu click handler
      >
        Menu
      </Link>

      {/* Customer-specific links */}
      {isAuthenticated && !isAdmin && (
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
          <Link href="/profile" className="hover:underline">
            {session?.user?.name || "Profile"}
          </Link>
          <SignOutButton />
        </>
      ) : (
        <Link href="/login" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Sign in</Link>
      )}
    </div>
  );
}
