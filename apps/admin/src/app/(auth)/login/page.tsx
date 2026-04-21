"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@buyease/ui";
import logo from "@/app/logo.png";

type LoginStage = "password" | "twoFactor";

type LoginFormState = {
  email: string;
  password: string;
  twoFactorCode: string;
  rememberDevice: boolean;
  error: string | null;
  loading: boolean;
  showPassword: boolean;
  stage: LoginStage;
};

type LoginResponse = {
  ok?: boolean;
  code?: string;
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
    twoFactorCode: "",
    rememberDevice: false,
    error: null,
    loading: false,
    showPassword: false,
    stage: "password",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, loading: true, error: null }));

    const payload: Record<string, string> = {
      email: state.email.trim().toLowerCase(),
      password: state.password,
      rememberDevice: state.stage === "twoFactor" && state.rememberDevice ? "true" : "false",
    };

    if (state.stage === "twoFactor") {
      payload.twoFactorCode = state.twoFactorCode.trim();
    }

    const result = (await signIn("credentials", {
      ...payload,
      redirect: false,
    })) as LoginResponse | undefined;

    if (result?.code === "TWO_FACTOR_REQUIRED") {
      setState((current) => ({
        ...current,
        loading: false,
        error: null,
        stage: "twoFactor",
        twoFactorCode: "",
      }));
      return;
    }

    if (result?.code === "INVALID_TWO_FACTOR_CODE") {
      setState((current) => ({
        ...current,
        loading: false,
        error: "Invalid two-factor code.",
        stage: "twoFactor",
        twoFactorCode: "",
      }));
      return;
    }

    if (!result?.ok) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Invalid email or password.",
        stage: "password",
        twoFactorCode: "",
      }));
    } else {
      if (state.stage === "twoFactor" && state.rememberDevice) {
        await fetch("/api/admin/auth/remember-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rememberDevice: true }),
        });
      }
      router.push(callbackUrl);
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

            {state.stage === "twoFactor" && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Two-factor authentication required</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app to finish signing in.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <label htmlFor="two-factor-code" className="block text-sm font-medium">
                    2FA code
                  </label>
                  <input
                    id="two-factor-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={state.twoFactorCode}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        twoFactorCode: event.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className={cn(
                      "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-center font-mono text-sm tracking-[0.35em] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                      state.error && "border-destructive"
                    )}
                    placeholder="000000"
                  />
                </div>

                <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={state.rememberDevice}
                    onChange={(event) =>
                      setState((current) => ({ ...current, rememberDevice: event.target.checked }))
                    }
                    className="mt-0.5 size-4 rounded border border-input bg-background"
                  />
                  <span>
                    Remember this device for 15 days.
                  </span>
                </label>
              </div>
            )}

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {state.loading && <Loader2 className="size-4 animate-spin" />}
              {state.stage === "twoFactor" ? "Verify and sign in" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
            {state.stage === "twoFactor" && (
              <button
                type="button"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    stage: "password",
                    twoFactorCode: "",
                    rememberDevice: false,
                    error: null,
                  }))
                }
                className="mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to password
              </button>
            )}
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
