import { Suspense } from "react";
import { AppShellDynamic } from "./app-shell-dynamic";

/** Avoid Turbopack static prerender of Polaris (`createContext` SSR bug with client layout root). */
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <AppShellDynamic>{children}</AppShellDynamic>
    </Suspense>
  );
}
