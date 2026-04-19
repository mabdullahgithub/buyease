"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_NAME = "buyease_required_cookies";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  return null;
}

function setConsentCookie(value: "accepted" | "declined") {
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(() => {
    if (typeof document === "undefined") return false;
    return !getCookie(COOKIE_NAME);
  });

  const handleChoice = (value: "accepted" | "declined") => {
    setConsentCookie(value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="glass-surface-strong mx-auto flex w-full max-w-xl flex-col gap-3 rounded-lg p-3 shadow-md ring-1 ring-white/15 dark:ring-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 rounded-md bg-primary/10 p-1 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <p className="text-xs text-muted-foreground">
            We use required cookies to keep BuyEase secure and functional.
            Please confirm your preference. See our{" "}
            <Link href="/cookie-policy" className="text-teal-600 hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => handleChoice("declined")}
          >
            Decline
          </Button>
          <Button type="button" size="xs" onClick={() => handleChoice("accepted")}>
            Allow Required
          </Button>
        </div>
      </div>
    </div>
  );
}
