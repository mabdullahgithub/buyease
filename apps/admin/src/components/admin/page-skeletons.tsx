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

export function SettingsPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 lg:h-[calc(100svh-120px)] lg:flex-row lg:gap-0 lg:overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="shrink-0 border-b border-border pb-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:border-sidebar-border/60 lg:pb-0 lg:pr-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      <section className="mx-auto min-w-0 max-w-4xl flex-1 pt-4 lg:h-full lg:overflow-y-auto lg:px-8 lg:pt-0">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-80" />
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
