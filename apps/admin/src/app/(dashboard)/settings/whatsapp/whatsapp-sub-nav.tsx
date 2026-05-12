"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/whatsapp", label: "Provider" },
  { href: "/settings/whatsapp/templates", label: "Templates" },
] as const;

export function WhatsAppSubNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b pb-0">
      {TABS.map((tab) => {
        const active =
          tab.href === "/settings/whatsapp"
            ? pathname === "/settings/whatsapp"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
              active
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
