import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@buyease/db", "@buyease/utils"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Do not set X-Frame-Options: DENY — embedded apps load inside
          // admin.shopify.com iframes. Iframe CSP is set in src/middleware.ts.
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
