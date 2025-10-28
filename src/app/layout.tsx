// File: app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import ChatWidget from '@/components/ai/ChatWidget';
import AuthProvider from '@/components/AuthProvider';
import Navigation from '@/components/NavLinks';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Restaurant AI Automation System',
  description: 'AI-powered restaurant experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50">
        <AuthProvider>
          {/* Header with Navigation */}
          <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 sm:h-18 items-center justify-between gap-4">
                {/* Logo */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  aria-label="Restaurant AI Home"
                >
                  <span className="sr-only">Restaurant AI</span>
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    aria-hidden="true"
                    className="flex-shrink-0"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path d="M12 8v8M8 12h8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hidden sm:inline-block tracking-tight">Restaurant AI</span>
                </Link>

                {/* Navigation */}
                <div className="flex-1">
                  <Navigation />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-auto">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Brand Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Restaurant AI
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Experience the future of dining with AI-powered menu automation, seamless reservations, and intelligent order management.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                    Quick Links
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <Link 
                        href="/privacy" 
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-blue-600 transition-colors" />
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/terms" 
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-blue-600 transition-colors" />
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/contact" 
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-blue-600 transition-colors" />
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Copyright & Social */}
                <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                    Connect With Us
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                    © {new Date().getFullYear()} Restaurant AI. All rights reserved.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">
                    Transforming dining experiences with artificial intelligence.
                  </p>
                </div>
              </div>
            </div>
          </footer>

          {/* AI Chat Widget */}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}