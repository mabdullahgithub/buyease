import { SHOPIFY_EMBED_HOST_COOKIE } from "@/lib/embedded-app-url";
import { serializeSetCookie } from "@/lib/forward-set-cookies";

export const SHOPIFY_SESSION_COOKIE = "shopify_session";
export const SHOPIFY_SHOP_COOKIE = "shopify_shop";
export const SHOPIFY_RETURN_TO_COOKIE = "shopify_return_to";

/**
 * Expire all BuyEase Shopify browser cookies. Attribute names must match
 * `serializeSetCookie` calls in `/api/auth` and `/api/auth/token-exchange`.
 */
export function buildClearShopifyAppCookieLines(secure: boolean): string[] {
  const noneSession = {
    httpOnly: true,
    secure,
    sameSite: "none" as const,
    path: "/",
    maxAge: 0,
  };
  const laxAux = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  return [
    serializeSetCookie(SHOPIFY_SESSION_COOKIE, "", noneSession),
    serializeSetCookie(SHOPIFY_SHOP_COOKIE, "", noneSession),
    serializeSetCookie(SHOPIFY_RETURN_TO_COOKIE, "", laxAux),
    serializeSetCookie(SHOPIFY_EMBED_HOST_COOKIE, "", laxAux),
  ];
}
