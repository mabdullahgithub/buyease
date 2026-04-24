import type { Metadata } from "next";
import type { ReactNode } from "react";

import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "BuyEase Merchant",
  description: "BuyEase Shopify merchant app",
};

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
        <ui-nav-menu>
          <a href="/" rel="home">Home</a>
          <a href="/form-builder">Form Builder</a>
          <a href="/upsells">Upsells</a>
          <a href="/analytics">Analytics</a>
          <a href="/settings">Settings</a>
          <a href="/billing">Billing Plans</a>
        </ui-nav-menu>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
