"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SettingsTab = {
  href?: string;
  label: string;
  group: "Configuration" | "Integrations" | "Billing";
  upcoming?: boolean;
};

const SETTINGS_TABS: SettingsTab[] = [
  {
    href: "/settings/system",
    group: "Configuration",
    label: "System",
  },
  {
    group: "Configuration",
    label: "Admin users",
    upcoming: true,
  },
  {
    group: "Configuration",
    label: "Authentication",
    upcoming: true,
  },
  {
    group: "Integrations",
    label: "API keys",
    upcoming: true,
  },
  {
    group: "Billing",
    label: "Subscription",
    upcoming: true,
  },
];

const GROUPS: Array<SettingsTab["group"]> = ["Configuration", "Integrations", "Billing"];

export function SettingsTabsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-r border-border pr-3 lg:w-60">
      <div className="space-y-3">
        <p className="px-2 text-sm font-semibold text-foreground">Settings</p>
        {GROUPS.map((group) => (
          <div key={group} className="space-y-1">
            <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{group}</p>
            <nav className="space-y-0.5">
              {SETTINGS_TABS.filter((tab) => tab.group === group).map((tab) => {
                const active = !!tab.href && pathname.startsWith(tab.href);
                return tab.href ? (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                ) : (
                  <span
                    key={`${group}-${tab.label}`}
                    className="block cursor-not-allowed rounded-md px-2 py-1.5 text-[13px] text-muted-foreground/60"
                    aria-disabled
                  >
                    {tab.label}
                  </span>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
