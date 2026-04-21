"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

const NAV: { href: string; label: string; icon: React.ElementType }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchants", label: "Merchants", icon: Users },
  { href: "/plans", label: "Plans", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/recent-activities", label: "Recent activity", icon: Activity },
  { href: "/settings/system", label: "System settings", icon: Settings },
  { href: "/account/security", label: "Account security", icon: Shield },
];

type AdminCommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminCommandMenu({ open, onOpenChange }: AdminCommandMenuProps) {
  const router = useRouter();

  const run = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Go to page"
      description="Search navigation"
      showCloseButton={false}
    >
      <CommandInput placeholder="Search pages…" />
      <CommandList>
        <CommandEmpty>No page found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV.map(({ href, label, icon: Icon }) => (
            <CommandItem key={href} value={`${label} ${href}`} onSelect={() => run(href)}>
              <Icon />
              <span>{label}</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
