"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toasts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Brand SVGs ──────────────────────────────────────────────────────────────

function TwilioLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      aria-label="Twilio"
      role="img"
    >
      <circle cx="30" cy="30" r="30" fill="#F22F46" />
      {/* Twilio's four-dot pattern */}
      <circle cx="20" cy="20" r="5.5" fill="white" />
      <circle cx="40" cy="20" r="5.5" fill="white" />
      <circle cx="20" cy="40" r="5.5" fill="white" />
      <circle cx="40" cy="40" r="5.5" fill="white" />
    </svg>
  );
}

function WhatsAppLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-label="WhatsApp"
      role="img"
    >
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      <path
        fill="white"
        d="M24 10.5C16.544 10.5 10.5 16.544 10.5 24c0 2.38.637 4.608 1.748 6.533L10.5 37.5l7.196-1.726A13.43 13.43 0 0024 37.5c7.456 0 13.5-6.044 13.5-13.5S31.456 10.5 24 10.5zm7.388 18.657c-.31.87-1.529 1.593-2.514 1.804-.67.143-1.544.257-4.487-.964-3.77-1.547-6.2-5.38-6.39-5.629-.183-.248-1.538-2.047-1.538-3.907 0-1.86.973-2.772 1.317-3.154a1.38 1.38 0 011-.467c.248 0 .497.005.714.015.23.01.537-.087.84.642.31.748 1.055 2.608 1.147 2.797.093.19.155.41.031.661-.12.257-.18.416-.354.64-.174.228-.366.507-.523.68-.174.194-.355.403-.152.79.203.383.9 1.487 1.934 2.408 1.33 1.188 2.45 1.556 2.797 1.73.347.173.549.144.75-.087.203-.23.872-1.016 1.105-1.364.23-.347.46-.288.775-.173.314.115 2 .943 2.343 1.115.344.173.573.258.657.402.083.144.083.838-.228 1.709z"
      />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; error?: string } | null;

type Config = {
  provider: string;
  accountSid: string | null;
  authToken: string | null;
  senderNumber: string | null;
  wabaId: string | null;
  pricePerMessage: number;
  isEnabled: boolean;
};

type Props = {
  config: Config;
  saveAction: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

// ─── Credential field sets ────────────────────────────────────────────────────

function TwilioFields({
  config,
  showToken,
  onToggleToken,
}: {
  config: Config;
  showToken: boolean;
  onToggleToken: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-1">
        <TwilioLogo size={28} />
        <div>
          <p className="text-sm font-semibold">Twilio credentials</p>
          <p className="text-xs text-muted-foreground">
            From your{" "}
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Twilio Console
            </a>{" "}
            home page
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input
            id="accountSid"
            name="accountSid"
            defaultValue={config.accountSid ?? ""}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            Starts with <code className="text-[10px]">AC</code> — visible on
            the Console dashboard.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="authToken">Auth Token</Label>
          <div className="relative">
            <Input
              id="authToken"
              name="authToken"
              type={showToken ? "text" : "password"}
              defaultValue={config.authToken ?? ""}
              placeholder="••••••••••••••••••••••••••••••••"
              autoComplete="off"
              className="pr-9"
            />
            <button
              type="button"
              onClick={onToggleToken}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Treat like a password. Never expose to merchants.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="senderNumber">From number</Label>
        <Input
          id="senderNumber"
          name="senderNumber"
          defaultValue={config.senderNumber ?? ""}
          placeholder="whatsapp:+14155238886"
          autoComplete="off"
          className="max-w-sm"
        />
        <p className="text-[11px] text-muted-foreground">
          Format:{" "}
          <code className="text-[10px]">whatsapp:+&lt;country&gt;&lt;number&gt;</code>.
          Use the Twilio sandbox number for testing, or your approved production
          number.
        </p>
      </div>

      {/* Hidden empty WABA ID so server action always receives it */}
      <input type="hidden" name="wabaId" value="" />
    </div>
  );
}

function MetaFields({
  config,
  showToken,
  onToggleToken,
}: {
  config: Config;
  showToken: boolean;
  onToggleToken: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-1">
        <WhatsAppLogo size={28} />
        <div>
          <p className="text-sm font-semibold">
            WhatsApp Business Cloud API credentials
          </p>
          <p className="text-xs text-muted-foreground">
            From{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Meta for Developers
            </a>{" "}
            → Your App → WhatsApp → API Setup
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="senderNumber">Phone Number ID</Label>
          <Input
            id="senderNumber"
            name="senderNumber"
            defaultValue={config.senderNumber ?? ""}
            placeholder="123456789012345"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            Found in WhatsApp → API Setup under the &quot;From&quot; number.
            This is the numeric ID, not the phone number itself.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wabaId">WABA ID</Label>
          <Input
            id="wabaId"
            name="wabaId"
            defaultValue={config.wabaId ?? ""}
            placeholder="123456789012345"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            WhatsApp Business Account ID — found in Business Settings →
            Accounts → WhatsApp Accounts.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="authToken">Permanent Access Token</Label>
        <div className="relative">
          <Input
            id="authToken"
            name="authToken"
            type={showToken ? "text" : "password"}
            defaultValue={config.authToken ?? ""}
            placeholder="EAAxxxxxx…"
            autoComplete="off"
            className="pr-9"
          />
          <button
            type="button"
            onClick={onToggleToken}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showToken ? "Hide token" : "Show token"}
          >
            {showToken ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Generate a <strong>System User</strong> permanent token in Meta
          Business Portfolio → Users → System Users. Temporary tokens expire in
          24 h and are{" "}
          <span className="text-destructive font-medium">
            not suitable for production
          </span>
          .
        </p>
      </div>

      {/* Hidden empty Account SID for Twilio field — keeps server action consistent */}
      <input type="hidden" name="accountSid" value="" />
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function WhatsAppGlobalForm({ config, saveAction }: Props) {
  const [result, formAction, isPending] = useActionState(saveAction, null);
  const [showToken, setShowToken] = useState(false);
  const [provider, setProvider] = useState(config.provider);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      appToast.settingsChanged("WhatsApp settings saved.");
    } else {
      appToast.settingsError(result.error ?? "Failed to save settings.");
    }
  }, [result]);

  return (
    <form action={formAction} className="space-y-8">

      {/* ── Enable toggle ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Enable WhatsApp messaging</p>
          <p className="text-xs text-muted-foreground">
            When enabled, merchants can activate WhatsApp notifications and will
            be charged per message.
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            id="isEnabled"
            name="isEnabled"
            type="checkbox"
            defaultChecked={config.isEnabled}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
          <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* ── Provider selector ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label htmlFor="provider">Messaging provider</Label>
        <div className="flex items-center gap-4">
          {/* Twilio option */}
          <label
            className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ${
              provider === "TWILIO"
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="provider"
              value="TWILIO"
              checked={provider === "TWILIO"}
              onChange={() => setProvider("TWILIO")}
              className="sr-only"
            />
            <TwilioLogo size={28} />
            <div>
              <p className="text-sm font-medium">Twilio</p>
              <p className="text-xs text-muted-foreground">
                Easy setup · Sandbox available
              </p>
            </div>
            <div
              className={`ml-auto size-4 rounded-full border-2 transition-colors ${
                provider === "TWILIO"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            />
          </label>

          {/* Meta WhatsApp option */}
          <label
            className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ${
              provider === "WHATSAPP_BUSINESS"
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="provider"
              value="WHATSAPP_BUSINESS"
              checked={provider === "WHATSAPP_BUSINESS"}
              onChange={() => setProvider("WHATSAPP_BUSINESS")}
              className="sr-only"
            />
            <WhatsAppLogo size={28} />
            <div>
              <p className="text-sm font-medium">WhatsApp Cloud API</p>
              <p className="text-xs text-muted-foreground">
                Direct Meta · Lower cost
              </p>
            </div>
            <div
              className={`ml-auto size-4 rounded-full border-2 transition-colors ${
                provider === "WHATSAPP_BUSINESS"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {provider === "TWILIO"
            ? "Twilio acts as a Business Solution Provider (BSP) — they route messages through WhatsApp's API on your behalf. Easiest to get started with the sandbox."
            : "Direct integration with Meta's WhatsApp Cloud API via graph.facebook.com. Requires Meta Business verification. Lower per-message cost with no BSP markup."}
        </p>
      </div>

      {/* ── Provider-specific credential fields ──────────────────────────── */}
      <div className="rounded-lg border p-4">
        {provider === "TWILIO" ? (
          <TwilioFields
            config={config}
            showToken={showToken}
            onToggleToken={() => setShowToken((v) => !v)}
          />
        ) : (
          <MetaFields
            config={config}
            showToken={showToken}
            onToggleToken={() => setShowToken((v) => !v)}
          />
        )}
      </div>

      {/* ── Per-message pricing ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="pricePerMessage">Price per message (cents)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            id="pricePerMessage"
            name="pricePerMessage"
            type="number"
            min="0"
            step="0.0001"
            defaultValue={config.pricePerMessage}
            className="w-28"
          />
          <span className="text-xs text-muted-foreground">
            cents &nbsp;(e.g.&nbsp;0.5&nbsp;=&nbsp;$0.005 · 5&nbsp;=&nbsp;$0.05 per message)
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Deducted from each merchant&apos;s credit balance on every successful
          send. Set above your provider&apos;s cost to cover margin.
        </p>
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={isPending}>
          <MessageCircle className="mr-2 size-4" />
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
