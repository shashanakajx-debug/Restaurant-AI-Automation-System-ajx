"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import SignOutButton from "./signoutbutton";

export default function AuthNav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/menu" className="hover:underline">Menu</Link>
      <Link href="/cart" className="hover:underline">Cart</Link>
      <Link href="/reservations" className="hover:underline">Reservations</Link>
      
      {isAuthenticated ? (
        <>
          <Link href="/profile" className="hover:underline">
            {session?.user?.name || "Profile"}
          </Link>
          <SignOutButton />
        </>
      ) : (
        <Link href="/login" className="hover:underline">Sign in</Link>
      )}
    </div>
  );
}