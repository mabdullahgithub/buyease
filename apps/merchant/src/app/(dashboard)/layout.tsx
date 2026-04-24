import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <main style={{ padding: 24 }}>
      {children}
    </main>
  );
}
