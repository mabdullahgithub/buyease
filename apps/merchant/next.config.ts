import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@buyease/db", "@buyease/utils"],
  serverExternalPackages: ["@prisma/client", "prisma"],
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
