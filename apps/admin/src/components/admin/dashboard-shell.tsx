"use client";

import * as React from "react";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    /*
      Layout:
        ┌──────────────────────────────────────────┐
        │  Navbar (full width, sticky top)         │
        ├───────────┬──────────────────────────────┤
        │  Sidebar  │  Content area                │
        │           │  (breadcrumb + page title    │
        │           │   live here, inside pages)   │
        └───────────┴──────────────────────────────┘

      SidebarProvider wraps everything so sidebar state is
      available to the Navbar's SidebarTrigger.
    */
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <div className="flex h-svh w-full flex-col overflow-hidden">
        {/* Full-width navbar — sits above both sidebar and content */}
        <AdminNavbar />

        {/* Sidebar + content row */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <main className="w-full min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
            <footer className="h-6 shrink-0 border-t border-border/50 bg-background px-4 text-[10px] text-muted-foreground/50 md:px-6 lg:px-8">
              <div className="flex h-full items-center justify-center">
                Build by Muhammad Abdullah with ❤️ from 🇵🇰
              </div>
            </footer>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
