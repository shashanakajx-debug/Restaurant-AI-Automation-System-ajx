"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");

      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-gray-500">Enter your email to receive a password reset link</p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded">
          <p>Password reset link has been sent to your email address (if an account exists).</p>
          <p className="mt-2">
            <Link href="/login" className="text-blue-600 hover:underline">
              Return to login
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded" role="alert">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) {
                  setFormErrors((p) => {
                    const copy = { ...p };
                    delete copy.email;
                    return copy;
                  });
                }
              }}
              disabled={isLoading}
              className={`border rounded p-2 w-full ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
              placeholder="you@example.com"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? "email-error" : undefined}
            />
            {formErrors.email && (
              <p id="email-error" className="text-sm text-red-600">
                {formErrors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            aria-busy={isLoading}
          >
            {isLoading ? "Processing..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
