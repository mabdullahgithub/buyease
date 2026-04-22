"use client";

import { useActionState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

import { appToast } from "@/lib/toasts";
import { logSettingsChange } from "@/lib/settings-activity";
import type { AdminIpAccessMode } from "@/lib/admin-ip-policy";

type ActionResult = { success: boolean; error?: string; mode?: AdminIpAccessMode };

const MODE_LABELS: Record<AdminIpAccessMode, string> = {
  ALLOW_ALL: "Allow all public IPs",
  RESTRICTED_ALLOWLIST: "Restricted with allowlist",
};

export function IpAccessModeDropdown({
  mode,
  action,
}: {
  mode: AdminIpAccessMode;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData): Promise<ActionResult> => {
      const selectedMode = String(formData.get("mode") ?? "").trim();
      if (selectedMode !== "ALLOW_ALL" && selectedMode !== "RESTRICTED_ALLOWLIST") {
        return { success: false, error: "Invalid access mode." };
      }

      const modeValue: AdminIpAccessMode = selectedMode;

      const result = await action(formData);
      return {
        ...result,
        mode: modeValue,
      };
    },
    null
  );

  useEffect(() => {
    if (!state) return;

    if (!state.success) {
      appToast.settingsError("Could not update IP access mode", {
        description: state.error ?? "Please try again.",
      });
      return;
    }

    const currentMode = state.mode;
    if (!currentMode) return;

    void logSettingsChange({
      action: "IP_ALLOWLIST_MODE_UPDATED",
      category: "SECURITY",
      description:
        currentMode === "ALLOW_ALL"
          ? "Set admin IP access mode to allow all public IPs"
          : "Set admin IP access mode to restricted allowlist",
      metadata: { mode: currentMode },
      showToast: true,
    });
  }, [state]);

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Access mode
        </p>
      </div>
      <form action={formAction} className="space-y-2">
        <select
          name="mode"
          defaultValue={mode}
          disabled={pending}
          onChange={(event) => {
            event.currentTarget.form?.requestSubmit();
          }}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="ALLOW_ALL">{MODE_LABELS.ALLOW_ALL}</option>
          <option value="RESTRICTED_ALLOWLIST">{MODE_LABELS.RESTRICTED_ALLOWLIST}</option>
        </select>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Blocked IPs are always denied, regardless of selected mode.
      </p>
    </div>
  );
}
