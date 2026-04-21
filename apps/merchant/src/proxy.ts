import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api/auth",
  "/api/auth/install",
  "/api/auth/session",
  "/api/webhooks",
  "/install",
  "/api/health",
];

/**
 * CSP for embedded Shopify admin — see
 * https://shopify.dev/docs/apps/build/security/set-up-iframe-protection
 */
function contentSecurityPolicyFrameAncestors(request: NextRequest): string {
  const shopRaw = request.nextUrl.searchParams.get("shop");
  const origins: string[] = ["https://admin.shopify.com"];
  if (shopRaw) {
    const normalized = shopRaw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)) {
      origins.unshift(`https://${normalized}`);
    }
  }
  return `frame-ancestors ${origins.join(" ")};`;
}

function withShopifyEmbeddedHeaders(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", contentSecurityPolicyFrameAncestors(request));
  return response;
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return withShopifyEmbeddedHeaders(req, NextResponse.next());
  }

  const sessionId = req.cookies.get("shopify_session")?.value;
  if (!sessionId) {
    const installUrl = new URL("/install", req.url);
    installUrl.searchParams.set("return_to", pathname);

    const queryShop = req.nextUrl.searchParams.get("shop");
    if (queryShop) {
      installUrl.searchParams.set("shop", queryShop);
    }

    return withShopifyEmbeddedHeaders(req, NextResponse.redirect(installUrl));
  }

  if (pathname === "/") {
    return withShopifyEmbeddedHeaders(req, NextResponse.redirect(new URL("/form-builder", req.url)));
  }

  return withShopifyEmbeddedHeaders(req, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
