"use client"
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const email = String(formData.get('email') || '')
      const password = String(formData.get('password') || '')
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.ok) {
        window.location.href = '/'
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form action={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm">Email</label>
          <input className="input" type="email" name="email" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Password</label>
          <input className="input" type="password" name="password" required />
        </div>
        <button className="btn-primary h-10" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  )
}
