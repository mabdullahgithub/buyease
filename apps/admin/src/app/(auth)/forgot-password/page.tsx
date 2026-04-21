"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@buyease/ui";
import logo from "@/app/logo.png";

type FormState = {
  email: string;
  loading: boolean;
  message: string | null;
  error: string | null;
};

export default function ForgotPasswordPage() {
  const [state, setState] = useState<FormState>({
    email: "",
    loading: false,
    message: null,
    error: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, loading: true, message: null, error: null }));

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email.trim() }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error ?? "Something went wrong. Try again later.",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        loading: false,
        message:
          data.message ??
          "If an account exists for this email, you will receive reset instructions shortly.",
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Network error. Check your connection and try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src={logo}
            alt="BuyEase"
            width={160}
            height={41}
            priority
            className="h-auto w-[160px]"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-semibold mb-1">Forgot password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your work email. If an account exists, we will send a reset link.
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={state.email}
                onChange={(e) =>
                  setState((s) => ({ ...s, email: e.target.value }))
                }
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                  state.error && "border-destructive"
                )}
                placeholder="admin@buyease.app"
              />
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            {state.message && (
              <p className="text-sm text-muted-foreground">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {state.loading && <Loader2 className="size-4 animate-spin" />}
              Send reset link
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
