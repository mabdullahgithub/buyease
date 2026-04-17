import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyEase — Smarter Selling on Shopify",
  description:
    "BuyEase supercharges your Shopify store with AI-powered product recommendations, one-click upsells, and real-time analytics. Join the waitlist for early access.",
  keywords: [
    "Shopify app",
    "ecommerce",
    "upsell",
    "product recommendations",
    "Shopify merchant",
    "AI commerce",
  ],
  openGraph: {
    title: "BuyEase — Smarter Selling on Shopify",
    description:
      "AI-powered product recommendations, one-click upsells & real-time analytics for Shopify merchants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='buyease-theme';var stored=localStorage.getItem(key);var theme=(stored==='light'||stored==='dark')?stored:'light';document.documentElement.classList.toggle('dark',theme==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
