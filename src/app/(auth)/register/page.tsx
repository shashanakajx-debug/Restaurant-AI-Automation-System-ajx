'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { z } from 'zod';
import { registerSchema } from '@/schemas/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
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
      registerSchema.parse(formData);
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
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      
      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
      
      // Redirect to home page after successful sign-in
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid gap-2">
          <label className="text-sm" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.name && (
            <p className="text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
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
          <label className="text-sm" htmlFor="password">Password</label>
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
          <p className="text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>
        
        <div className="grid gap-2">
          <label className="text-sm" htmlFor="role">Register as</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.role ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          {formErrors.role && (
            <p className="text-sm text-red-600">{formErrors.role}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}