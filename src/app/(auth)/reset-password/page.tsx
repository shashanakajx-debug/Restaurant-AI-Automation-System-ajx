"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Invalid or missing reset token');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setTokenValid(false);
          setError(data.error || 'Invalid or expired token');
        } else {
          setTokenValid(true);
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setTokenValid(false);
        setError('Failed to verify reset token');
      }
    };

    verifyToken();
  }, [token]);

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
      resetPasswordSchema.parse(formData);
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="max-w-sm mx-auto grid gap-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="text-gray-500">Enter your new password below</p>
      </div>
      
      {!tokenValid ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          <p>{error || 'Invalid or expired password reset link'}</p>
          <p className="mt-2">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Request a new password reset link
            </Link>
          </p>
        </div>
      ) : success ? (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded">
          <p>Your password has been reset successfully.</p>
          <p className="mt-2">
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in with your new password
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid gap-2">
            <label className="text-sm" htmlFor="password">New Password</label>
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
          
          <div className="grid gap-2">
            <label className="text-sm" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`border rounded p-2 w-full ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}