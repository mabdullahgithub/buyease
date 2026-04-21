import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "@shopify/polaris/build/esm/styles.css";
import { EmbeddedSessionBootstrap } from "@/components/merchant/embedded-session-bootstrap";
import { EmbeddedTopLevelRedirect } from "@/components/merchant/embedded-top-level-redirect";
import { PersistShopifyEmbedParams } from "@/components/merchant/persist-shopify-embed-params";

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
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          />
        ) : null}
        <div
          dangerouslySetInnerHTML={{
            __html: `<ui-nav-menu>
  <a href="/overview" rel="home">Home</a>
  <a href="/form-builder">Form Builder</a>
  <a href="/quantity-offers">Quantity Offers</a>
  <a href="/upsells-downsells">Upsells &amp; Downsells</a>
  <a href="/integrations-messaging">Integrations &amp; Messaging</a>
  <a href="/analytics">Analytics</a>
  <a href="/settings">Settings</a>
  <a href="/plan">Billing Plans</a>
</ui-nav-menu>`,
          }}
        />
        <EmbeddedTopLevelRedirect />
        <PersistShopifyEmbedParams />
        <EmbeddedSessionBootstrap />
        {children}
      </body>
    </html>
  );
}
