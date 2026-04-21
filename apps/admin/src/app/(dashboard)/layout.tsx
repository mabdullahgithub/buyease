import { AdminDashboardShell } from "@/components/admin/dashboard-shell";
import { requireAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="min-h-svh bg-background">
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </div>
  );
}
