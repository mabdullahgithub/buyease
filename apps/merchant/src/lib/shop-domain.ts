/**
 * Session token JWT `dest` is a full admin URL (`https://{shop}.myshopify.com/...`).
 * `sanitizeShop` / `getOfflineId` expect the bare shop hostname.
 */
export function shopHostnameFromSessionTokenDest(dest: string): string {
  const normalized = dest.startsWith("http") ? dest : `https://${dest}`;
  return new URL(normalized).hostname;
}
