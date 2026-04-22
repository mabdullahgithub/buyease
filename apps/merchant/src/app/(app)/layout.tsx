import { Suspense } from "react";
import { AppShellDynamic } from "./app-shell-dynamic";
import { MerchantAppSkeleton } from "@/components/merchant/app-skeleton";

/** Avoid Turbopack static prerender of Polaris (`createContext` SSR bug with client layout root). */
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<MerchantAppSkeleton />}>
      <AppShellDynamic>{children}</AppShellDynamic>
    </Suspense>
  );
}
