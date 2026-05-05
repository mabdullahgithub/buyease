"use client";

import { useTransition, useState } from "react";
import { Power, PowerOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logSettingsChange } from "@/lib/settings-activity";

type MaintenanceFormProps = {
  enabled: boolean;
  message: string;
  retryAfter: number;
  toggleAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

export function MaintenanceForm({
  enabled,
  message,
  retryAfter,
  toggleAction,
  updateAction,
}: MaintenanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleToggle(formData: FormData) {
    setError(null);
    const turningOn = formData.get("enabled") === "true";
    startTransition(async () => {
      const result = await toggleAction(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to toggle.");
      } else {
        await logSettingsChange({
          action: turningOn ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
          category: "SYSTEM",
          description: turningOn
            ? "Enabled maintenance mode — merchant API returning 503"
            : "Disabled maintenance mode — merchant API restored",
        });
      }
    });
  }

  function handleSave(formData: FormData) {
    setError(null);
    setSaveSuccess(false);
    startSaveTransition(async () => {
      const result = await updateAction(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to save.");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await logSettingsChange({
          action: "MAINTENANCE_SETTINGS_UPDATED",
          category: "SYSTEM",
          description: "Updated maintenance mode message and retry-after settings",
          showToast: false,
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Toggle section */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {enabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                Maintenance active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                App online
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "All merchant API routes are returning 503. Toggle off to restore service."
              : "The merchant app is operating normally."}
          </p>
        </div>
        <form action={handleToggle}>
          <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
          <Button
            type="submit"
            variant={enabled ? "default" : "destructive"}
            size="sm"
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : enabled ? (
              <>
                <Power className="mr-1.5 size-3.5" />
                Bring online
              </>
            ) : (
              <>
                <PowerOff className="mr-1.5 size-3.5" />
                Enable
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Settings form */}
      <form action={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maintenance-message">Maintenance message</Label>
          <Textarea
            id="maintenance-message"
            name="message"
            defaultValue={message}
            rows={3}
            placeholder="Message displayed to merchants during maintenance..."
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Shown to merchants when they hit any API endpoint during maintenance.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retry-after">Retry-After (seconds)</Label>
          <Input
            id="retry-after"
            name="retryAfter"
            type="number"
            defaultValue={retryAfter}
            min={30}
            max={86400}
            className="max-w-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Tells clients how long to wait before retrying. Included as a Retry-After HTTP header.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {saveSuccess && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Settings saved.</p>
        )}

        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : null}
          Save settings
        </Button>
      </form>
    </div>
  );
}
