'use client'

import { useEffect } from 'react'

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Menu Error:', error)
  }, [error])

  return (
    <div className="grid place-items-center gap-4 p-4">
      <h2 className="text-xl font-semibold">Something went wrong loading the menu!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}