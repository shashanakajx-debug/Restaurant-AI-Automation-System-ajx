"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { z } from 'zod';
import { loginSchema } from '@/schemas/auth';

export default function SignInPage() {
  const router = useRouter();
  // Avoid using `useSearchParams` here (it can cause prerender/suspense issues
  // during build). Read the callback param on submit from window.location so the
  // page stays a simple client component.
  const getCallbackUrl = () => {
    try {
      if (typeof window === 'undefined') return '/';
      const params = new URLSearchParams(window.location.search);
      return params.get('callbackUrl') || '/';
    } catch (e) {
      return '/';
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with:', { email: formData.email });
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      console.log('Sign in result:', result);
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
  router.push(getCallbackUrl());
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid gap-2">
          <label className="text-sm" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.email && (
            <p className="text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.password && (
            <p className="text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p className="text-sm text-center">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
