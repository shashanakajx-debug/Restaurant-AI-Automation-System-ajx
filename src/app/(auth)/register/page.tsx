"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { registerSchema } from "@/schemas/auth";

type FormData = { name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", password: "" });
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
      registerSchema.parse(formData);
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
      // POST to your registration endpoint (consistent with server code)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");

      // After register, sign in automatically
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        // If automatic sign-in failed, navigate to login page with message
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className={`border rounded p-2 w-full ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "name-error" : undefined}
          />
          {formErrors.name && (
            <p id="name-error" className="text-sm text-red-600">
              {formErrors.name}
            </p>
          )}
        </div>

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
          <label className="text-sm" htmlFor="password">
            Password
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
          <p className="text-xs text-gray-500">At least 8 characters, with uppercase, lowercase, and a number.</p>
        </div>

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
