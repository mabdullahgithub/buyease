"use client";

import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { MerchantAppSkeleton } from "@/components/merchant/app-skeleton";

const MerchantAppShell = nextDynamic(() => import("./merchant-app-shell"), {
  ssr: false,
  loading: () => <MerchantAppSkeleton />,
});

export function AppShellDynamic({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<MerchantAppSkeleton />}>
      <MerchantAppShell>{children}</MerchantAppShell>
    </Suspense>
  );
}
