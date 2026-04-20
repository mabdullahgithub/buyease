import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "@shopify/polaris/build/esm/styles.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuyEase — Merchant App",
  description: "BuyEase COD Form & Upsells for Shopify merchants.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={comfortaa.variable}>
      <head />
      <body>{children}</body>
    </html>
  );
}
