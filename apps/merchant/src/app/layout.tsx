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
        <Providers>
          {/* Shopify App Bridge NavMenu — renders in the Shopify admin sidebar */}
          <s-app-nav>
            <s-link href="/" rel="home">Home</s-link>
            <s-link href="/form-builder">Form Builder</s-link>
            <s-link href="/upsells">Upsells</s-link>
            <s-link href="/analytics">Analytics</s-link>
            <s-link href="/settings">Settings</s-link>
            <s-link href="/billing">Billing Plans</s-link>
          </s-app-nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
