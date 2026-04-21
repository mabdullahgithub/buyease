/** Shopify `host` query param (base64-ish); used to validate cookie reinjection. */
export const EMBEDDED_HOST_PARAM_RE = /^[A-Za-z0-9+/=_-]+$/;

/** Query keys Shopify needs to keep the app inside the admin iframe. */
export const EMBEDDED_QUERY_KEYS = ["shop", "host", "embedded", "locale", "session"] as const;

export const SHOPIFY_EMBED_HOST_COOKIE = "shopify_embed_host";

export function mergeEmbeddedSearchParams(
  target: URL,
  source: Pick<URLSearchParams, "get">
): void {
  for (const key of EMBEDDED_QUERY_KEYS) {
    const v = source.get(key);
    if (v) {
      target.searchParams.set(key, v);
    }
  }
}

/**
 * Appends `shop`, `host`, etc. from the current admin context onto an internal path.
 * Polaris `Navigation` `url` values must include these or the iframe breaks out to a bare tab.
 */
export function appendEmbeddedAppQuery(
  path: string,
  source: Pick<URLSearchParams, "get">
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const qIndex = normalized.indexOf("?");
  const pathname = qIndex === -1 ? normalized : normalized.slice(0, qIndex);
  const existing = qIndex === -1 ? "" : normalized.slice(qIndex + 1);
  const out = new URLSearchParams(existing);
  for (const key of EMBEDDED_QUERY_KEYS) {
    const v = source.get(key);
    if (v) {
      out.set(key, v);
    }
  }
  const qs = out.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
