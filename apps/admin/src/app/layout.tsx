import type { Metadata } from "next";
import { Comfortaa, Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { AppSessionProvider } from "@/components/providers/app-session-provider";
import { SonnerToaster } from "@/components/ui/sonner-toaster";

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
  const themeScript = `
    (() => {
      try {
        const stored = localStorage.getItem("buyease-theme");
        const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
        const resolved = theme === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : theme;
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      } catch {}
    })();
  `;
  const prepaintStyles = `
    :root { background: #020617; color-scheme: dark; }
    html.dark { background: #020617; color-scheme: dark; }
    html.light { background: #f8f9fa; color-scheme: light; }
    body { background: inherit; }
  `;

  return (
    <html lang="en" className={`${inter.variable} ${comfortaa.variable}`} suppressHydrationWarning>
      <head>
        <style>{prepaintStyles}</style>
        <Script id="buyease-theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <AppSessionProvider>
          {children}
          <SonnerToaster />
        </AppSessionProvider>
      </body>
    </html>
  );
}
