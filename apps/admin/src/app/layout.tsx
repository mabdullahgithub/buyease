import type { Metadata } from "next";
import { Comfortaa, Inter } from "next/font/google";

import "./globals.css";
import { AppSessionProvider } from "@/components/providers/app-session-provider";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuyEase Admin",
  description: "BuyEase super admin panel — internal use only.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${comfortaa.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
