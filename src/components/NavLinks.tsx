"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X, Home, Utensils, Calendar, Package, LayoutDashboard, ClipboardList, Settings } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const { items = [] } = useCart() as { items: { quantity: number }[] };
  const pathname = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';

  const cartCount = items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) ?? 0;

  const getLinkClassName = (href: string, isMobile = false) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    const baseClass = isMobile
      ? 'flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium'
      : 'inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium';

    const activeClass = isActive
      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100';

    return `${baseClass} ${activeClass}`;
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const navigationLinks = {
    public: [
      { href: '/', label: 'Home', icon: Home },
      { href: '/food-menu', label: 'Menu', icon: Utensils },
    ],
    authenticated: [
      { href: '/reservations', label: 'Reservations', icon: Calendar },
      { href: '/my-orders', label: 'My Orders', icon: Package },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
      { href: '/admin/menu', label: 'Menu Mgmt', icon: Settings },
    ],
  };

  const renderLinks = (isMobile = false) => (
    <>
      {navigationLinks.public.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={getLinkClassName(link.href, isMobile)}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{link.label}</span>
          </Link>
        );
      })}

      {isAuthenticated && !isAdmin &&
        navigationLinks.authenticated.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClassName(link.href, isMobile)}
              onClick={() => isMobile && setMobileMenuOpen(false)}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}

      {isAdmin &&
        navigationLinks.admin.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClassName(link.href, isMobile)}
              onClick={() => isMobile && setMobileMenuOpen(false)}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
    </>
  );

  return (
    <nav className="flex items-center justify-between w-full" aria-label="Primary Navigation">
      <div className="hidden md:flex items-center gap-2 flex-1">
        {renderLinks()}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {isLoading ? (
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        ) : isAuthenticated ? (
          <>
            <Link
              href="/profile"
              className="hidden md:inline-flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 group"
              title={session?.user?.name || 'Profile'}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {session?.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <span className="max-w-[8rem] truncate text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {session?.user?.name || 'Profile'}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-red-600 dark:text-red-400 group"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
        )}

        <Link
          href="/cart"
          className="relative inline-flex items-center justify-center p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 group"
          title="Shopping Cart"
          aria-label={`Shopping cart with ${cartCount} items`}
        >
          <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold leading-none px-2 py-1 rounded-full min-w-[22px] text-center shadow-lg">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 sm:top-18 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-2xl md:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="space-y-2">
              {renderLinks(true)}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                      {session?.user?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session?.user?.email || ''}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className={getLinkClassName('/profile', true)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}