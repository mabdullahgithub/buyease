import { SettingsTabsSidebar } from "@/components/admin/settings-tabs-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-0">
      <div className="shrink-0 border-b border-border pb-4 lg:w-52 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-0">
        <SettingsTabsSidebar />
      </div>
      <section className="min-w-0 flex-1 pt-4 lg:pl-10 lg:pt-0">
        {children}
      </section>
    </div>
  );
}
