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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full flex-col">
        {/* Full-width navbar — sits above both sidebar and content */}
        <AdminNavbar />

        {/* Sidebar + content row */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col overflow-auto">
            <main className="w-full flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
