import type { Metadata } from "next";
import "@shopify/polaris/build/esm/styles.css";

export const metadata: Metadata = {
  title: "BuyEase — Merchant App",
  description: "BuyEase COD Form & Upsells for Shopify merchants.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
