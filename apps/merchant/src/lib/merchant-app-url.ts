function resolveRawAppUrl(): string | undefined {
  const raw = (process.env.HOST ?? process.env.SHOPIFY_APP_URL)?.trim();
  return raw || undefined;
}

/** Host only, for @shopify/shopify-api `hostName` (no protocol, no path). */
export function merchantAppHostname(): string {
  const raw = resolveRawAppUrl();
  if (!raw) return "localhost";
  const withoutProto = raw.replace(/^https?:\/\//, "");
  return withoutProto.split("/")[0] ?? "localhost";
}

/** Base URL for redirects and billing return URLs (no trailing slash). */
export function merchantAppOrigin(): string {
  const raw = resolveRawAppUrl();
  if (!raw) {
    throw new Error("HOST or SHOPIFY_APP_URL must be set");
  }
  return raw.replace(/\/$/, "");
}
