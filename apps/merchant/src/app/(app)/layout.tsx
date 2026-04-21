import { Suspense } from "react";
import { MerchantAppShell } from "./merchant-app-shell";

/** Avoid Turbopack static prerender of Polaris (`createContext` SSR bug with client layout root). */
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <MerchantAppShell>{children}</MerchantAppShell>
    </Suspense>
  );
}
