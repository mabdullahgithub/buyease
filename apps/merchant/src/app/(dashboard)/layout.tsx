import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/form-builder", label: "Form Builder" },
  { href: "/upsells", label: "Upsells" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
];

export default function DashboardLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
