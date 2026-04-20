const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

/**
 * Validates and normalizes a Shopify shop domain.
 */
export function validateShopDomain(shop: string): string | null {
  const normalized = shop.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (!SHOP_DOMAIN_REGEX.test(normalized)) {
    return null;
  }

  return normalized;
}
