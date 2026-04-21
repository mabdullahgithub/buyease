import { NextRequest, NextResponse } from "next/server";
import { validateShopDomain } from "@/lib/auth";
import {
  EMBEDDED_HOST_PARAM_RE,
  mergeEmbeddedSearchParams,
  SHOPIFY_EMBED_HOST_COOKIE,
} from "@/lib/embedded-app-url";
import { urlFromSameOriginReferrerIfEmbedded } from "@/lib/referer-embed-restore";
import { normalizeShopifyAppsPathname } from "@/lib/shopify-apps-path-prefix";

const PUBLIC_PATHS = [
  "/api/auth",
  "/api/auth/install",
  "/api/auth/session",
  "/api/webhooks",
  "/install",
  "/api/health",
];

function withShopifyEmbeddedHeaders(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", contentSecurityPolicyFrameAncestors(request));
  return response;
}

/**
 * CSP for embedded Shopify — see
 * https://shopify.dev/docs/apps/build/security/set-up-iframe-protection
 *
 * The admin UI often nests the app so the *immediate* framing origin is
 * https://{shop}.myshopify.com, not only admin.shopify.com. Missing *.myshopify.com
 * commonly surfaces as a blank iframe (especially in Safari).
 * dev.shopify.com / partners.shopify.com cover Partner Dev Dashboard embeds.
 */
function contentSecurityPolicyFrameAncestors(request: NextRequest): string {
  const shopRaw = request.nextUrl.searchParams.get("shop");
  const origins: string[] = [
    "https://admin.shopify.com",
    "https://*.myshopify.com",
    "https://dev.shopify.com",
    "https://partners.shopify.com",
  ];
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

export function proxy(req: NextRequest): NextResponse {
  const rawPathname = req.nextUrl.pathname;
  const pathname = normalizeShopifyAppsPathname(rawPathname);

  // Recover `shop` + `host` before any public-route short-circuit (e.g. `/install` is "public"
  // but must still be able to 302 back to the Referer embed URL when params were dropped).
  if (!rawPathname.startsWith("/api/")) {
    const shopFromCookie = req.cookies.get("shopify_shop")?.value;
    const embedHostCookie = req.cookies.get(SHOPIFY_EMBED_HOST_COOKIE)?.value;
    const shopCookieOk = shopFromCookie ? validateShopDomain(shopFromCookie) : null;
    const hostCookieOk =
      embedHostCookie && EMBEDDED_HOST_PARAM_RE.test(embedHostCookie) ? embedHostCookie : null;

    if (
      shopCookieOk &&
      hostCookieOk &&
      !req.nextUrl.searchParams.get("host") &&
      !rawPathname.startsWith("/api/")
    ) {
      const url = req.nextUrl.clone();
      url.pathname = pathname;
      url.searchParams.set("shop", shopCookieOk);
      url.searchParams.set("host", hostCookieOk);
      mergeEmbeddedSearchParams(url, req.nextUrl.searchParams);
      return withShopifyEmbeddedHeaders(req, NextResponse.redirect(url));
    }

    const fromReferrer = urlFromSameOriginReferrerIfEmbedded(req);
    if (fromReferrer) {
      return withShopifyEmbeddedHeaders(req, NextResponse.redirect(fromReferrer));
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) => rawPathname.startsWith(p));

  if (isPublic) {
    return withShopifyEmbeddedHeaders(req, NextResponse.next());
  }

  const sessionId = req.cookies.get("shopify_session")?.value;
  if (!sessionId) {
    const shop = req.nextUrl.searchParams.get("shop");
    const host = req.nextUrl.searchParams.get("host");
    const embeddedShopify = Boolean(shop && host);

    // Embedded admin (managed install): skip /install + OAuth round trip; App Bridge
    // token exchange sets cookies from the client (rules §5A first load, §5F).
    if (embeddedShopify) {
      if (pathname === "/") {
        const toFormBuilder = new URL("/form-builder", req.url);
        toFormBuilder.search = req.nextUrl.search;
        return withShopifyEmbeddedHeaders(req, NextResponse.redirect(toFormBuilder));
      }
      if (rawPathname.startsWith("/api/")) {
        return withShopifyEmbeddedHeaders(
          req,
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      return withShopifyEmbeddedHeaders(req, NextResponse.next());
    }

    const installUrl = new URL("/install", req.url);
    installUrl.searchParams.set("return_to", pathname);

    const preserveInstallParams = ["shop", "host", "locale", "session", "timestamp", "hmac", "embedded"] as const;
    for (const key of preserveInstallParams) {
      const value = req.nextUrl.searchParams.get(key);
      if (value !== null && value !== "") {
        installUrl.searchParams.set(key, value);
      }
    }

    return withShopifyEmbeddedHeaders(req, NextResponse.redirect(installUrl));
  }

  if (pathname === "/") {
    const toFormBuilder = new URL("/form-builder", req.url);
    mergeEmbeddedSearchParams(toFormBuilder, req.nextUrl.searchParams);
    return withShopifyEmbeddedHeaders(req, NextResponse.redirect(toFormBuilder));
  }

  return withShopifyEmbeddedHeaders(req, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
