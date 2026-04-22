import { Skeleton } from "@/components/ui/skeleton";

function SkeletonPill({ className }: { className?: string }) {
  return <Skeleton className={`h-8 rounded-md ${className ?? ""}`} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-7 rounded-md" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <Skeleton className="h-5 w-44" />
      </div>
      <div className="space-y-0">
        <div className="grid grid-cols-6 gap-3 border-b border-border/70 px-6 py-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-3 border-b border-border/40 px-6 py-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <SkeletonPill className="w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SkeletonPill className="w-56" />
        <SkeletonPill className="w-28" />
        <SkeletonPill className="w-36" />
      </div>

      <SkeletonTable />
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <section className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="flex gap-3 overflow-hidden px-1 py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card py-4">
              <div className="flex flex-col items-center gap-2 px-2">
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="size-4 rounded-sm" />
          </div>
          <Skeleton className="mt-6 h-[200px] w-full rounded-md" />
        </div>
      </section>
    </div>
  );
}

export function MerchantsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
      <SkeletonTable rows={10} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-44" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export function PlansPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-44" />
      </div>
      <SkeletonTable rows={8} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonTable rows={6} />
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}

export function LogsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="mt-0.5 size-4 rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="ml-auto h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10/12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecentActivitiesPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3 overflow-hidden px-1 py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="flex gap-4">
          <div className="w-[200px] space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3.5 py-3">
                  <Skeleton className="size-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                  <Skeleton className="size-7 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function DashboardDetailPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-md border border-border bg-card p-6">
            <Skeleton className="h-5 w-44" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <SkeletonTable rows={6} />
        </div>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-svh w-full max-w-md items-center justify-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full rounded-lg border border-border bg-card p-8">
        <div className="space-y-2">
          <Skeleton className="mx-auto h-7 w-28" />
          <Skeleton className="mx-auto h-4 w-52" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-4 w-28 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="mt-6 h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="mt-6 h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-md border border-border bg-card p-5">
        <Skeleton className="h-5 w-48" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SystemSettingsSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-[420px]" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <div className="rounded-md border border-border bg-card p-5 xl:row-span-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="mt-5 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-border bg-card p-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-52" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-4/5 rounded-md" />
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-44" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-full rounded-md" />
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-4 w-96" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SecuritySettingsSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-[460px]" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-md border border-border bg-card p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-4 h-10 w-full rounded-md" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-28" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-3/4" />
        <div className="mt-4 rounded-xl border border-border/70 p-4">
          <Skeleton className="h-4 w-80" />
          <Skeleton className="mt-2 h-3 w-72" />
          <Skeleton className="mt-3 h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function AdminShellLoadingSkeleton() {
  return (
    <div className="min-h-svh bg-background" aria-busy="true" aria-live="polite">
      {/* Navbar shell (44px) */}
      <div className="sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border bg-background px-2">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-7 rounded-[5px]" />
          <Skeleton className="h-4 w-px rounded-none" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-4 w-px rounded-none" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-56 rounded-[5px]" />
          <Skeleton className="size-7 rounded-[5px]" />
          <Skeleton className="size-7 rounded-[5px]" />
          <Skeleton className="h-4 w-px rounded-none mx-1" />
          <Skeleton className="size-6 rounded-full" />
        </div>
      </div>

      {/* Sidebar + content shell */}
      <div className="flex h-[calc(100svh-44px)] overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border/60 md:block">
          <div className="space-y-2 px-2 py-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-[5px]" />
            ))}
          </div>
        </aside>

        <main className="w-full flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <DashboardPageSkeleton />
        </main>
      </div>
    </div>
  );
}
