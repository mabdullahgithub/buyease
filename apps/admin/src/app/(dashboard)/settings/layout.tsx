import { SettingsTabsSidebar } from "@/components/admin/settings-tabs-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsTabsSidebar />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
