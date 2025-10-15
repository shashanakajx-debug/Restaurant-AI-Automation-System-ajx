"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((p) => {
        const copy = { ...p };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    try {
      resetPasswordSchema.parse(formData);
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

    if (!token) {
      setError("Missing reset token");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setSuccess(true);
      // Optionally redirect to login after short delay
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-sm mx-auto grid gap-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          <p>{error || "Invalid or expired password reset link"}</p>
          <p className="mt-2">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Request a new password reset link
            </Link>
          </p>
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

      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded">
          <p>Your password has been reset successfully.</p>
          <p className="mt-2">
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in with your new password
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
            <label className="text-sm" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`border rounded p-2 w-full ${formErrors.password ? "border-red-500" : "border-gray-300"}`}
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? "password-error" : undefined}
            />
            {formErrors.password && (
              <p id="password-error" className="text-sm text-red-600">
                {formErrors.password}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`border rounded p-2 w-full ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
              aria-invalid={!!formErrors.confirmPassword}
              aria-describedby={formErrors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {formErrors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-red-600">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            aria-busy={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
