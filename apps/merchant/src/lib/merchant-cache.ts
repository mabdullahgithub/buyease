import { revalidateTag } from "next/cache";

/**
 * Tags for future `fetch(..., { next: { tags } })` / `unstable_cache` usage.
 * Safe to call from Route Handlers after install, uninstall, or GDPR redact.
 */
export function invalidateMerchantAppCache(shop: string): void {
  try {
    revalidateTag(`merchant:${shop}`, "max");
    revalidateTag(`orders:${shop}`, "max");
  } catch {
    /* e.g. missing incremental cache in non-App contexts */
  }
}
