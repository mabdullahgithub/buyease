"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem  = { href: string; label: string; icon: React.ElementType };
type NavGroup = { items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analytics",  label: "Analytics",  icon: BarChart3 },
    ],
  },
  {
    items: [
      { href: "/merchants", label: "Merchants", icon: Users },
      { href: "/plans",     label: "Plans",     icon: CreditCard },
    ],
  },
  {
    items: [
      { href: "/logs",      label: "Logs",      icon: ScrollText },
    ],
  },
  {
    items: [
      { href: "/settings",         label: "Settings", icon: Settings },
      { href: "/account/security", label: "Account",  icon: Shield },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="!top-[44px] !h-[calc(100svh-44px)]"
    >

      {/* ── Navigation ── */}
      <SidebarContent className="pt-2">
        {GROUPS.map((group, gi) => (
          <SidebarGroup
            key={gi}
            className={cn(
              "px-2 py-1",
              gi < GROUPS.length - 1 && "border-b border-sidebar-border/60",
            )}
          >
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item: NavItem) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className={cn(
                          "h-10 rounded-[5px]",
                          isActive
                            ? "!bg-sidebar-accent !text-sidebar-accent-foreground !font-medium"
                            : "!bg-transparent !text-sidebar-foreground hover:!bg-sidebar-accent hover:!text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-[18px] shrink-0",
                            isActive ? "opacity-90" : "opacity-50",
                          )}
                        />
                        <span className="text-[14px]">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
