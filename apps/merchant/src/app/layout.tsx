import type { Metadata } from "next";
import type { ReactNode } from "react";


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
  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!} />
        {/* App Bridge MUST be the first script, loaded synchronously (no async/defer/module).
            Next.js <Script> adds `async` even with beforeInteractive, so we use a raw tag. */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body>
        {/* Add hidden so Next.js doesn't render these links on screen */}
        <ui-nav-menu>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              rel={item.href === "/" ? "home" : undefined}
            >
              {item.label}
            </a>
          ))}
        </ui-nav-menu>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
