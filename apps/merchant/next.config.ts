import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    "@shopify/polaris",
    "@shopify/polaris-icons",
    "@shopify/app-bridge-react",
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
          // Do not set X-Frame-Options: DENY — embedded apps load inside Shopify
          // admin / shop iframes. CSP frame-ancestors is set in `src/proxy.ts` (Next.js proxy).
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
