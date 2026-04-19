import { redirect } from "next/navigation";

import { AdminDashboardShell } from "@/components/admin/dashboard-shell";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-svh bg-background">
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </div>
  );
}
