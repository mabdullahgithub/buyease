/**
 * Shopify may hit the app origin with `/apps/{client_id}/…` (same shape as the admin URL).
 * App routes live at `/form-builder`, `/plan`, etc. Strip the prefix for routing and redirects.
 */
export function normalizeShopifyAppsPathname(rawPathname: string): string {
  const m = /^\/apps\/[^/]+\/?(.*)$/.exec(rawPathname);
  if (!m) {
    return rawPathname;
  }
  const rest = (m[1] ?? "").replace(/^\/+/, "");
  return rest ? `/${rest}` : "/";
}
