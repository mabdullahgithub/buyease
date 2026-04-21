import { EMBEDDED_HOST_PARAM_RE } from "@/lib/embedded-app-url";

/**
 * Decodes the `host` query param Shopify sends for embedded apps.
 * @see `@shopify/shopify-api` test helper `getHostValue` — payload is `admin.shopify.com/store/{handle}`.
 */
export function decodeShopifyHostParamToAdminPath(hostParam: string): string | null {
  if (!EMBEDDED_HOST_PARAM_RE.test(hostParam)) {
    return null;
  }
  try {
    const padLen = (4 - (hostParam.length % 4)) % 4;
    const standardB64 = hostParam.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
    const binary = atob(standardB64);
    const decoded = decodeURIComponent(
      [...binary].map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join("")
    );
    if (!/^admin\.shopify\.com\/store\/[a-z0-9_-]+$/i.test(decoded)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Full Shopify Admin URL that loads this app inside the admin iframe (same as opening from Apps).
 */
export function shopifyAdminEmbeddedAppUrl(params: {
  hostParam: string;
  clientId: string;
  pathname: string;
  search: string;
}): string | null {
  const hostPath = decodeShopifyHostParamToAdminPath(params.hostParam);
  if (!hostPath) {
    return null;
  }
  const path = params.pathname.startsWith("/") ? params.pathname : `/${params.pathname}`;
  const qs = params.search
    ? params.search.startsWith("?")
      ? params.search
      : `?${params.search}`
    : "";
  return `https://${hostPath}/apps/${params.clientId}${path}${qs}`;
}
