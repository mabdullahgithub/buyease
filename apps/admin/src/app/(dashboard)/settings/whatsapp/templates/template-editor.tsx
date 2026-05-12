"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { WhatsAppMessageType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toasts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Template = {
  id: string;
  messageType: WhatsAppMessageType;
  metaTemplateName: string | null;
  body: string;
  variables: string[];
  metaStatus: string;
  isActive: boolean;
};

type ActionResult = { success: boolean; error?: string } | null;

type Props = {
  templates: Template[];
  saveAction: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

// ─── Per-type config ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  WhatsAppMessageType,
  { label: string; description: string; availableVars: string[] }
> = {
  ORDER_CONFIRMED: {
    label: "Order confirmed",
    description: "Sent immediately after a customer places a COD order.",
    availableVars: ["customerName", "orderId", "shopName", "totalPrice"],
  },
  ORDER_SHIPPED: {
    label: "Order shipped",
    description: "Sent when the order fulfillment status changes to shipped.",
    availableVars: ["orderId", "shopName", "trackingUrl", "carrierName"],
  },
  ORDER_DELIVERED: {
    label: "Order delivered",
    description: "Sent when the order fulfillment status changes to delivered.",
    availableVars: ["orderId", "shopName", "customerName"],
  },
  ABANDONED_CART: {
    label: "Abandoned cart",
    description: "Sent after the merchant-configured delay when a cart is left without checkout.",
    availableVars: ["shopName", "cartUrl", "productNames"],
  },
};

const META_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  NONE: { label: "Not submitted", className: "bg-muted text-muted-foreground" },
  PENDING: { label: "Pending review", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  PAUSED: { label: "Paused", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

const MAX_BODY_LENGTH = 1024;

// ─── Single template card ─────────────────────────────────────────────────────

function TemplateCard({
  template,
  saveAction,
}: {
  template: Template;
  saveAction: Props["saveAction"];
}): React.ReactElement {
  const [result, formAction, isPending] = useActionState(saveAction, null);
  const [body, setBody] = useState(template.body);
  const [isActive, setIsActive] = useState(template.isActive);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = TYPE_CONFIG[template.messageType];
  const metaStatus = META_STATUS_CONFIG[template.metaStatus] ?? META_STATUS_CONFIG.NONE;
  const charsLeft = MAX_BODY_LENGTH - body.length;

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      appToast.settingsChanged(`${config.label} template saved.`);
    } else {
      appToast.settingsError(result.error ?? "Failed to save template.");
    }
  }, [result, config.label]);

  function insertVariable(varName: string): void {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const token = `{{${varName}}}`;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    // Restore cursor after the inserted token
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* ── Card header ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{config.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${metaStatus.className}`}
            >
              {metaStatus.label}
            </span>
            {isActive ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <AlertCircle className="size-3" />
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          {!expanded && (
            <p className="mt-1 truncate text-xs text-foreground/70 font-mono">
              {body}
            </p>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* ── Expanded edit form ────────────────────────────────────────────── */}
      {expanded && (
        <form action={formAction} className="border-t px-4 pb-4 pt-4 space-y-5">
          <input type="hidden" name="messageType" value={template.messageType} />

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`body-${template.messageType}`}>Message body</Label>
              <span
                className={`text-[11px] tabular-nums ${
                  charsLeft < 50 ? "text-destructive font-medium" : "text-muted-foreground"
                }`}
              >
                {charsLeft} chars left
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id={`body-${template.messageType}`}
              name="body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX_BODY_LENGTH}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />

            {/* Variable chips */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">
                Click a variable to insert it at the cursor:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {config.availableVars.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="rounded-md border border-dashed bg-muted/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meta template name */}
          <div className="space-y-1.5">
            <Label htmlFor={`meta-${template.messageType}`}>
              Meta template name
            </Label>
            <Input
              id={`meta-${template.messageType}`}
              name="metaTemplateName"
              defaultValue={template.metaTemplateName ?? ""}
              placeholder="e.g. order_confirmed"
              className="max-w-xs font-mono text-sm"
            />
            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Info className="mt-px size-3 shrink-0" />
              Only required for Meta WhatsApp Cloud API. Must match the name
              registered and approved in Meta Business Manager
              (lowercase, underscores only).
            </p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                When off, this notification type is skipped even if the merchant
                has it enabled.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                name="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
              <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending || charsLeft < 0}>
              {isPending ? "Saving…" : "Save template"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Editor container ─────────────────────────────────────────────────────────

export function TemplateEditor({ templates, saveAction }: Props): React.ReactElement {
  const orderedTypes: WhatsAppMessageType[] = [
    "ORDER_CONFIRMED",
    "ORDER_SHIPPED",
    "ORDER_DELIVERED",
    "ABANDONED_CART",
  ];

  const templateMap = new Map(templates.map((t) => [t.messageType, t]));

  return (
    <div className="space-y-3">
      {orderedTypes.map((type) => {
        const template = templateMap.get(type);
        if (!template) return null;
        return (
          <TemplateCard key={type} template={template} saveAction={saveAction} />
        );
      })}
    </div>
  );
}
