"use client";

import * as React from "react";
import Link from "next/link";
import { Construction } from "lucide-react";

import { cn } from "@/lib/utils";

export function MaintenanceIndicator() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch("/api/admin/maintenance-status");
        if (!res.ok) return;
        const data = (await res.json()) as { enabled: boolean };
        if (mounted) setEnabled(data.enabled);
      } catch {
        // silent
      }
    }

    void check();
    const interval = setInterval(() => void check(), 15_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!enabled) return null;

  return (
    <Link
      href="/settings/maintenance"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
        "bg-destructive/10 text-destructive hover:bg-destructive/20"
      )}
    >
      <Construction className="size-3" />
      <span>Maintenance ON</span>
    </Link>
  );
}
