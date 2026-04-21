"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

type SettingsTab = {
  href?: string;
  label: string;
  group: "Configuration";
  external?: boolean;
  upcoming?: boolean;
};

const SETTINGS_TABS: SettingsTab[] = [
  { href: "/settings/system", group: "Configuration", label: "IP allowlisting" },
  { href: "/settings/security", group: "Configuration", label: "Security" },
];

const GROUPS: Array<SettingsTab["group"]> = [
  "Configuration",
];

export function SettingsTabsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-[76px] lg:w-52">
      <nav className="flex flex-col gap-6">
        <h2 className="text-[15px] font-semibold text-foreground">Settings</h2>

        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-0.5">
            <span className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {group}
            </span>
            {SETTINGS_TABS.filter((tab) => tab.group === group).map((tab) => {
              const active = !!tab.href && pathname.startsWith(tab.href);

              const content = (
                <>
                  <span className="truncate">{tab.label}</span>
                  {tab.external && (
                    <ExternalLink className="size-3 shrink-0 opacity-40" />
                  )}
                </>
              );

              if (tab.href) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-[7px] text-[13px] leading-tight transition-colors",
                      active
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <span
                  key={`${group}-${tab.label}`}
                  className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-[7px] text-[13px] leading-tight text-muted-foreground/40"
                  aria-disabled
                >
                  {content}
                </span>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
