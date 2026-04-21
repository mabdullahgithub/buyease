"use client";

import nextDynamic from "next/dynamic";
import { Suspense } from "react";

const MerchantAppShell = nextDynamic(() => import("./merchant-app-shell"), {
  ssr: false,
  loading: () => null,
});

export function AppShellDynamic({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <MerchantAppShell>{children}</MerchantAppShell>
    </Suspense>
  );
}
