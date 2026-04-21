import { redirect } from "next/navigation";

import { AdminDashboardShell } from "@/components/admin/dashboard-shell";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  if (!session) redirect("/login");

  return (
    <div className="min-h-svh bg-background">
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </div>
  );
}
