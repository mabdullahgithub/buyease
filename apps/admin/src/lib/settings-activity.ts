"use client";

import { appToast } from "./toasts";

export interface LogSettingsChangeParams {
  action: string;
  category: string;
  description: string;
  metadata?: Record<string, unknown>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

/**
 * Log a settings change and optionally show a toast notification
 * @param params Configuration object
 * @returns Promise with the logged activity or error
 */
export async function logSettingsChange(
  params: LogSettingsChangeParams
): Promise<{ ok: boolean; error?: string; activityId?: string }> {
  try {
    const response = await fetch("/api/admin/settings-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: params.action,
        category: params.category,
        description: params.description,
        metadata: params.metadata || null,
        status: "SUCCESS",
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      const errorMessage =
        error.error || "Failed to log settings change";

      if (params.showToast !== false) {
        appToast.settingsError("Could not save activity log", {
          description: errorMessage,
        });
      }

      params.onError?.(errorMessage);
      return { ok: false, error: errorMessage };
    }

    const data = (await response.json()) as {
      ok: boolean;
      activity?: { id: string };
    };

    if (params.showToast !== false) {
      appToast.settingsChanged(params.description);
    }

    params.onSuccess?.();
    return { ok: true, activityId: data.activity?.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (params.showToast !== false) {
      appToast.settingsError("Failed to log activity");
    }

    params.onError?.(errorMessage);
    return { ok: false, error: errorMessage };
  }
}

/**
 * Helper to show a loading toast and handle the async operation
 * Useful for longer-running settings changes
 */
export async function withLoadingToast<T>(
  message: string,
  operation: () => Promise<T>
): Promise<T> {
  const toastId = appToast.loading(message);

  try {
    const result = await operation();
    appToast.dismiss(toastId);
    return result;
  } catch (error) {
    appToast.dismiss(toastId);
    throw error;
  }
}
