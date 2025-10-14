"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";

interface ProfileComponentProps {
  user: Session["user"];
}

export default function ProfileComponent({ user }: ProfileComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Display different sections based on user role
  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Information</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            {isEditing ? (
              <input 
                type="text" 
                defaultValue={user.name || ""} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.name || "Not provided"}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-gray-900 capitalize">{user.role || "customer"}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            <p className="mt-1 text-gray-900">Active</p>
          </div>
        </div>
        
        {isEditing && (
          <div className="flex justify-end mt-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
      
      {/* Role-specific sections */}
      {isAdmin && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Admin Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/dashboard" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Admin Dashboard</span>
              <p className="text-sm text-gray-500 mt-1">Manage restaurant operations</p>
            </Link>
            <Link href="/admin/users" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">User Management</span>
              <p className="text-sm text-gray-500 mt-1">Manage user accounts</p>
            </Link>
            <Link href="/admin/menu" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Menu Management</span>
              <p className="text-sm text-gray-500 mt-1">Update restaurant menu</p>
            </Link>
            <Link href="/admin/orders" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Order Management</span>
              <p className="text-sm text-gray-500 mt-1">View and manage orders</p>
            </Link>
          </div>
        </div>
      )}
      
      {isStaff && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Staff Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/staff/orders" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Manage Orders</span>
              <p className="text-sm text-gray-500 mt-1">View and update order status</p>
            </Link>
            <Link href="/staff/reservations" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Reservations</span>
              <p className="text-sm text-gray-500 mt-1">Manage table reservations</p>
            </Link>
          </div>
        </div>
      )}
      
      {!isAdmin && !isStaff && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Customer Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/my-orders" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">My Orders</span>
              <p className="text-sm text-gray-500 mt-1">View your order history</p>
            </Link>
            <Link href="/reservations" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">My Reservations</span>
              <p className="text-sm text-gray-500 mt-1">Manage your table reservations</p>
            </Link>
            <Link href="/menu" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">Browse Menu</span>
              <p className="text-sm text-gray-500 mt-1">View our restaurant menu</p>
            </Link>
            <Link href="/cart" className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
              <span className="font-medium">My Cart</span>
              <p className="text-sm text-gray-500 mt-1">View your current cart</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}