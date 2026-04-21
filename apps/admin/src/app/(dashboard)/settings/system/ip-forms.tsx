"use client";

import { useActionState, useEffect, useRef } from "react";
import { Ban, Loader2, Plus, Trash2 } from "lucide-react";

import { logSettingsChange } from "@/lib/settings-activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionResult = { success: boolean; error?: string } | null;

function SubmitButton({
  pending,
  variant = "default",
  children,
}: {
  pending: boolean;
  variant?: "default" | "destructive";
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" variant={variant} disabled={pending} className="shrink-0">
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </Button>
  );
}

export function AddAllowlistForm({
  action,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await action(formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    null
  );

  useEffect(() => {
    if (!state?.success) return;

    void logSettingsChange({
      action: "ALLOWLIST_IP_ADDED",
      category: "SYSTEM",
      description: "Added IP to allowlist",
      showToast: true,
    });
  }, [state]);

  return (
    <div className="space-y-2">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="ip">IP address</Label>
          <Input id="ip" name="ip" required placeholder="203.0.113.10" />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="Office VPN" />
        </div>
        <SubmitButton pending={pending}>
          <Plus className="size-4" />
          Add IP
        </SubmitButton>
      </form>
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}

export function AddBlocklistForm({
  action,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await action(formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    null
  );

  useEffect(() => {
    if (!state?.success) return;

    void logSettingsChange({
      action: "BLOCKLIST_IP_ADDED",
      category: "SECURITY",
      description: "Blocked an IP address",
      showToast: true,
    });
  }, [state]);

  return (
    <div className="space-y-2">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="blocked-ip">IP address</Label>
          <Input
            id="blocked-ip"
            name="ip"
            required
            placeholder="198.51.100.42"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="blocked-label">Reason</Label>
          <Input
            id="blocked-label"
            name="label"
            placeholder="Suspicious traffic"
          />
        </div>
        <SubmitButton pending={pending} variant="destructive">
          <Ban className="size-4" />
          Block IP
        </SubmitButton>
      </form>
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}

export function RemoveIpButton({
  id,
  ip,
  action,
  label,
  activityAction,
  activityCategory,
  activityDescription,
}: {
  id: string;
  ip: string;
  action: (formData: FormData) => Promise<ActionResult>;
  label: string;
  activityAction: string;
  activityCategory: string;
  activityDescription: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      return action(formData);
    },
    null
  );

  useEffect(() => {
    if (!state?.success) return;

    void logSettingsChange({
      action: activityAction,
      category: activityCategory,
      description: activityDescription,
      metadata: { ip },
      showToast: true,
    });
  }, [activityAction, activityCategory, activityDescription, ip, state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        aria-label={label}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
        )}
      </Button>
    </form>
  );
}
