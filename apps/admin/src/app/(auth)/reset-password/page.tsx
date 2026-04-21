"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@buyease/ui";
import logo from "@/app/logo.png";

type FormState = {
  password: string;
  confirm: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  showPassword: boolean;
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<FormState>({
    password: "",
    confirm: "",
    loading: false,
    error: null,
    success: null,
    showPassword: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, loading: true, error: null, success: null }));

    if (!token) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Missing reset token. Open the link from your email.",
      }));
      return;
    }

    if (state.password !== state.confirm) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Passwords do not match.",
      }));
      return;
    }

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: state.password }),
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
          error: data.error ?? "Could not reset password.",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        loading: false,
        success: data.message ?? "Password updated.",
      }));
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Network error. Try again.",
      }));
    }
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Invalid or missing reset link. Request a new reset from the sign-in page.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-lg font-semibold mb-1">Set new password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Use at least 12 characters with upper, lower, and a number.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={state.showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={state.password}
              onChange={(e) =>
                setState((s) => ({ ...s, password: e.target.value }))
              }
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                state.error && "border-destructive"
              )}
            />
            <button
              type="button"
              onClick={() =>
                setState((s) => ({ ...s, showPassword: !s.showPassword }))
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={state.showPassword ? "Hide password" : "Show password"}
            >
              {state.showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            type={state.showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={state.confirm}
            onChange={(e) =>
              setState((s) => ({ ...s, confirm: e.target.value }))
            }
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-primary">{state.success}</p>
        )}

        <button
          type="submit"
          disabled={state.loading}
          className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {state.loading && <Loader2 className="size-4 animate-spin" />}
          Update password
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
  );
}

export default function ResetPasswordPage() {
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
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
