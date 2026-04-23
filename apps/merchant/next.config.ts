import type { NextConfig } from "next";

function devOriginFromAppUrl(): string[] {
  const raw = (process.env.HOST ?? process.env.SHOPIFY_APP_URL)?.trim();
  if (!raw) {
    return [];
  }
  try {
    const url = new URL(raw);
    return url.hostname ? [url.hostname] : [];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOriginFromAppUrl(),
  transpilePackages: ["@buyease/db", "@buyease/utils"],
  /**
   * Prevent Polaris / App Bridge from being bundled into the server SSR chunk.
   * These packages call React.createContext() at module evaluation time, which
   * fails when evaluated in the Next.js server context (server React does not
   * expose createContext). Marking them external means Node.js loads them via
   * require() at runtime (only when a client boundary actually needs them),
   * and they resolve against the full React in node_modules.
   */
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
  ],
  /**
   * Shopify Admin often loads the app origin with `/apps/{client_id}/…` (mirroring the
   * admin URL). App Router only defines `/form-builder`, `/plan`, etc. Map the prefix
   * before route matching so the iframe never 404s on `/apps/…`.
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/apps/:clientId", destination: "/" },
        { source: "/apps/:clientId/", destination: "/" },
        { source: "/apps/:clientId/:path*", destination: "/:path*" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.shopify.com https://maps.googleapis.com",
              "frame-ancestors https://*.myshopify.com https://admin.shopify.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
