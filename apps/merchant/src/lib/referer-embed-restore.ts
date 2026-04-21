import type { NextRequest } from "next/server";
import { validateShopDomain } from "@/lib/auth";
import { EMBEDDED_HOST_PARAM_RE } from "@/lib/embedded-app-url";

/**
 * When Shopify embed params are missing on the current request but the browser
 * still sends a same-origin Referer that includes `shop` + `host` (common after
 * a redirect dropped the query string), return that URL so the proxy can 302
 * back into a valid embedded context.
 */
export function urlFromSameOriginReferrerIfEmbedded(req: NextRequest): URL | null {
  if (req.nextUrl.searchParams.get("shop") && req.nextUrl.searchParams.get("host")) {
    return null;
  }

  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/api/")) {
    return null;
  }

  const referer = req.headers.get("referer");
  if (!referer) {
    return null;
  }

  let refUrl: URL;
  try {
    refUrl = new URL(referer);
  } catch {
    return null;
  }

  if (refUrl.origin !== req.nextUrl.origin) {
    return null;
  }

  const refShop = refUrl.searchParams.get("shop");
  const refHost = refUrl.searchParams.get("host");
  if (!refShop || !refHost) {
    return null;
  }
  if (!validateShopDomain(refShop)) {
    return null;
  }
  if (!EMBEDDED_HOST_PARAM_RE.test(refHost)) {
    return null;
  }

  return new URL(refUrl.toString());
}
