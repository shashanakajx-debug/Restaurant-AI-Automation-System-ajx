import './globals.css'
import type { Metadata } from 'next'
import ChatWidget from '@/components/ai/ChatWidget'
import AuthProvider from '@/components/AuthProvider'
import Link from 'next/link'
import NavLinks from '@/components/NavLinks'

export const metadata: Metadata = {
  title: 'Restaurant AI Automation System',
  description: 'AI-powered restaurant experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="border-b">
            <div className="container flex h-14 items-center justify-between">
              <Link href="/" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Restaurant AI</Link>
              <NavLinks />
            </div>
          </header>
          <main className="">
            {children}
          </main>
        </AuthProvider>
        <footer className="border-t">
          <div className="container py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Restaurant AI. All rights reserved.
          </div>
        </footer>
        <ChatWidget />
      </body>
    </html>
  )
}
