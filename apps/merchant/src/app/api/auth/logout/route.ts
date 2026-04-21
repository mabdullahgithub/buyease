import { NextRequest } from "next/server";
import { db } from "@buyease/db";
import { validateShopDomain } from "@/lib/auth";
import { redirectWithSetCookies } from "@/lib/forward-set-cookies";
import { buildClearShopifyAppCookieLines } from "@/lib/shopify-app-cookies";
import { invalidateMerchantAppCache } from "@/lib/merchant-cache";
import { shopifySessionStorage } from "@/lib/shopify";

function useSecureCookies(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Ends the merchant app session: revokes stored tokens for this shop when the
 * browser session id is valid, clears auth cookies, and sends the merchant to
 * Shopify admin (use `target="_top"` from embedded settings).
 */
export async function POST(request: NextRequest) {
  const clears = buildClearShopifyAppCookieLines(useSecureCookies());
  const sessionId = request.cookies.get("shopify_session")?.value;
  const shopRaw = request.cookies.get("shopify_shop")?.value ?? "";
  const shop = validateShopDomain(shopRaw);

  if (!shop) {
    return redirectWithSetCookies(new URL("/install", request.url), clears);
  }

  if (sessionId) {
    const session = await shopifySessionStorage.loadSession(sessionId);
    if (session?.shop === shop) {
      await db.session.deleteMany({ where: { shop } });
      invalidateMerchantAppCache(shop);
    } else {
      await shopifySessionStorage.deleteSession(sessionId);
    }
  }

  return redirectWithSetCookies(`https://${shop}/admin`, clears);
}
