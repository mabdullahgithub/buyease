"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  cn,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@buyease/ui";

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirm: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  showCurrent: boolean;
  showNew: boolean;
};

export function ChangePasswordForm() {
  const [state, setState] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirm: "",
    loading: false,
    error: null,
    success: null,
    showCurrent: false,
    showNew: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, loading: true, error: null, success: null }));

    if (state.newPassword !== state.confirm) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "New passwords do not match.",
      }));
      return;
    }

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: state.currentPassword,
          newPassword: state.newPassword,
        }),
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
          error: data.error ?? "Could not update password.",
        }));
        return;
      }

      setState({
        currentPassword: "",
        newPassword: "",
        confirm: "",
        loading: false,
        error: null,
        success: data.message ?? "Password updated.",
        showCurrent: false,
        showNew: false,
      });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Network error. Try again.",
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Use at least 12 characters with uppercase, lowercase, and a number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label
              htmlFor="current"
              className="block text-sm font-medium mb-1.5"
            >
              Current password
            </label>
            <div className="relative">
              <input
                id="current"
                type={state.showCurrent ? "text" : "password"}
                autoComplete="current-password"
                required
                value={state.currentPassword}
                onChange={(e) =>
                  setState((s) => ({ ...s, currentPassword: e.target.value }))
                }
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  state.error && "border-destructive"
                )}
              />
              <button
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, showCurrent: !s.showCurrent }))
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={state.showCurrent ? "Hide" : "Show"}
              >
                {state.showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new" className="block text-sm font-medium mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="new"
                type={state.showNew ? "text" : "password"}
                autoComplete="new-password"
                required
                value={state.newPassword}
                onChange={(e) =>
                  setState((s) => ({ ...s, newPassword: e.target.value }))
                }
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showNew: !s.showNew }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={state.showNew ? "Hide" : "Show"}
              >
                {state.showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirm"
              type={state.showNew ? "text" : "password"}
              autoComplete="new-password"
              required
              value={state.confirm}
              onChange={(e) =>
                setState((s) => ({ ...s, confirm: e.target.value }))
              }
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {state.loading && <Loader2 className="size-4 animate-spin" />}
            Update password
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
