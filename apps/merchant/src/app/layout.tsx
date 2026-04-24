import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "BuyEase Merchant",
  description: "BuyEase Shopify merchant app",
};

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/form-builder", label: "Form Builder" },
  { href: "/upsells", label: "Upsells" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing Plans" },
];

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  // Use either the public or server-side API key. Evaluated dynamically if possible.
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY || "";

  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={apiKey} />
        {/* App Bridge MUST be the first script, loaded synchronously (no async/defer/module). */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        {/* Prevent the nav menu from flashing or showing as HTML before App Bridge initializes */}
        <style>{`ui-nav-menu { display: none; }`}</style>
      </head>
      <body>
        <ui-nav-menu>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              rel={item.href === "/" ? "home" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </ui-nav-menu>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
