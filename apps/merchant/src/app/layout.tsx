import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import Script from "next/script";
import "@shopify/polaris/build/esm/styles.css";
import { EmbeddedSessionBootstrap } from "@/components/merchant/embedded-session-bootstrap";
import { EmbeddedTopLevelRedirect } from "@/components/merchant/embedded-top-level-redirect";
import { PersistShopifyEmbedParams } from "@/components/merchant/persist-shopify-embed-params";
import { WebVitalsReporter } from "@/components/merchant/web-vitals-reporter";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuyEase COD Form — Merchant",
  description: "BuyEase COD Form & Upsells for Shopify merchants.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";

  return (
    <html lang="en" className={comfortaa.variable}>
      <head>
        {apiKey ? <meta name="shopify-api-key" content={apiKey} /> : null}
      </head>
      <body>
        {apiKey ? (
          <Script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
            strategy="afterInteractive"
          />
        ) : null}
        <EmbeddedTopLevelRedirect />
        <PersistShopifyEmbedParams />
        <EmbeddedSessionBootstrap />
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
