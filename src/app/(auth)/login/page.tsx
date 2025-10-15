"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { loginSchema } from "@/schemas/auth";

export default function SignInPage() {
  const router = useRouter();

  const getCallbackUrl = () => {
    try {
      if (typeof window === "undefined") return "/";
      const params = new URLSearchParams(window.location.search);
      return params.get("callbackUrl") || "/";
    } catch {
      return "/";
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      loginSchema.parse(formData);
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

  // After signIn we attempt to read session and redirect based on role.
  // There can be a brief delay before session is available; we poll a few times.
  const redirectAfterSignIn = async (callbackUrl: string) => {
    const MAX_TRIES = 10;
    const DELAY = 200; // ms
    for (let i = 0; i < MAX_TRIES; i++) {
      // getSession reads the client session
      const session = await getSession();
      if (session?.user) {
        const role = (session.user as any).role;
        if (role === "ADMIN") {
          router.push("/admin/dashboard");
          return;
        }
        // default customer/user route
        router.push(callbackUrl === "/" ? "/dashboard" : callbackUrl);
        return;
      }
      // small delay
      await new Promise((r) => setTimeout(r, DELAY));
    }
    // fallback if session not available in time
    router.push(getCallbackUrl());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const callbackUrl = getCallbackUrl();
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        // NextAuth returns an `error` key on failure
        const message =
          result.error === "CredentialsSignin" ? "Invalid email or password" : result.error;
        throw new Error(message);
      }

      // Successful sign in — determine destination by session role
      await redirectAfterSignIn(callbackUrl);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? "email-error" : undefined}
          />
          {formErrors.email && (
            <p id="email-error" className="text-sm text-red-600">
              {formErrors.email}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm" htmlFor="password">
              Password
            </label>
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

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-60"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-sm text-center">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
