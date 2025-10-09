import './globals.css'
import type { Metadata } from 'next'
import ChatWidget from '@/components/ai/ChatWidget'

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
        <header className="border-b">
          <div className="container flex h-14 items-center justify-between">
            <a href="/" className="font-semibold">Restaurant AI</a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/menu" className="hover:underline">Menu</a>
              <a href="/cart" className="hover:underline">Cart</a>
              <a href="/reservations" className="hover:underline">Reservations</a>
              <a href="/auth/signin" className="hover:underline">Sign in</a>
            </nav>
          </div>
        </header>
        <main className="container py-8">
          {children}
        </main>
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
