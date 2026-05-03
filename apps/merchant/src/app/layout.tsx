import type { Metadata } from "next";
import type { ReactNode } from "react";

import Providers from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuyEase Merchant",
  description: "BuyEase Shopify merchant app",
};

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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
