"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@buyease/ui";
import { BrandLogo } from "@/components/admin/brand-logo";

type LoginFormState = {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  showPassword: boolean;
};

function safeCallbackUrl(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw || raw === "/") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const resetOk = searchParams.get("reset") === "success";

  const [state, setState] = useState<LoginFormState>({
    email: "",
    password: "",
    error: null,
    loading: false,
    showPassword: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, loading: true, error: null }));

    const result = await signIn("credentials", {
      email: state.email.trim().toLowerCase(),
      password: state.password,
      redirect: false,
    });

    if (result?.error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Invalid email or password.",
      }));
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <BrandLogo href="/" width={36} />
          <span className="text-xl font-bold tracking-tight">BuyEase Admin</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Restricted access — authorized personnel only.
          </p>

          {resetOk && (
            <p className="text-sm text-primary mb-4 rounded-lg bg-primary/10 px-3 py-2">
              Your password was reset. Sign in with your new password.
            </p>
          )}

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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={state.showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={state.password}
                  onChange={(e) =>
                    setState((s) => ({ ...s, password: e.target.value }))
                  }
                  className={cn(
                    "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                    state.error && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({ ...s, showPassword: !s.showPassword }))
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    state.showPassword ? "Hide password" : "Show password"
                  }
                >
                  {state.showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {state.loading && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
