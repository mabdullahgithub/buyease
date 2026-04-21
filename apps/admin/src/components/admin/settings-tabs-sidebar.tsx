"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, ShieldCheck, Server } from "lucide-react";

import { cn } from "@/lib/utils";

type SettingsTab = {
  href?: string;
  label: string;
  group: "Configuration";
  icon: React.ElementType;
  external?: boolean;
  upcoming?: boolean;
};

const SETTINGS_TABS: SettingsTab[] = [
  { href: "/settings/system", group: "Configuration", label: "IP allowlisting", icon: Server },
  { href: "/settings/security", group: "Configuration", label: "Security", icon: ShieldCheck },
];

const GROUPS: Array<SettingsTab["group"]> = [
  "Configuration",
];

export function SettingsTabsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0">
      <nav className="flex flex-col gap-6">
        <h2 className="text-[14px] font-medium text-foreground px-2">Settings</h2>

        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-1">
            <span className="mb-1 px-2 text-[12px] font-medium text-muted-foreground">
              {group}
            </span>
            {SETTINGS_TABS.filter((tab) => tab.group === group).map((tab) => {
              const active = !!tab.href && pathname.startsWith(tab.href);
              const Icon = tab.icon;

              const content = (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Icon className={cn("size-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} />
                  <span className="truncate">{tab.label}</span>
                  {tab.external && (
                    <ExternalLink className="size-3 shrink-0 opacity-40 ml-1" />
                  )}
                </div>
              );

              if (tab.href) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "flex h-9 items-center justify-between rounded-md px-2 text-[14px] leading-tight transition-colors",
                      active
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <span
                  key={`${group}-${tab.label}`}
                  className="flex h-9 cursor-not-allowed items-center justify-between rounded-md px-2 text-[14px] leading-tight text-muted-foreground/40"
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
