import { SettingsTabsSidebar } from "@/components/admin/settings-tabs-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-row lg:gap-0">
      <div className="shrink-0 border-b border-border pb-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:border-sidebar-border/60 lg:pb-0 lg:pr-4">
        <div className="lg:sticky lg:top-0">
          <SettingsTabsSidebar />
        </div>
      </div>
      <section className="mx-auto min-w-0 max-w-4xl flex-1 pt-4 pb-4 lg:px-8 lg:pt-0 lg:pb-8">
        {children}
      </section>
    </div>
  );
}
