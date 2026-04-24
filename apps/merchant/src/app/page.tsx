import type { ReactElement } from "react";

import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";
import { exchangeSessionToken } from "@/lib/token-exchange";

import { ComingSoonPage } from "@/components/ComingSoonPage";

type HomePageProps = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

/**
 * Resolves the shop domain from URL params.
 * Prefers the `shop` param; falls back to decoding the `id_token` JWT.
 */
async function resolveShop(
  shop: string | undefined,
  idToken: string | undefined,
): Promise<{ shop: string | null; idToken: string | undefined }> {
  if (shop) {
    try {
      const sanitized = shopify.utils.sanitizeShop(shop, true);
      return { shop: sanitized, idToken };
    } catch {
      return { shop: null, idToken };
    }
  }

  if (idToken) {
    try {
      const payload = await shopify.session.decodeSessionToken(idToken);
      const hostname = shopHostnameFromSessionTokenDest(payload.dest);
      const sanitized = shopify.utils.sanitizeShop(hostname, true);
      return { shop: sanitized, idToken };
    } catch {
      return { shop: null, idToken };
    }
  }

  return { shop: null, idToken: undefined };
}

/**
 * Gets or creates the offline session for a shop.
 *
 * Fast path (95% of requests): session is in LRU memory cache → ~0ms.
 * Cold path (first load after install): token exchange → ~150ms one-time.
 */
async function getOrCreateSession(
  shop: string,
  idToken: string | undefined,
): Promise<boolean> {
  const sessionId = shopify.session.getOfflineId(shop);
  const cached = await getCachedSession(sessionId);
  if (cached) return true;

  if (idToken) {
    try {
      await exchangeSessionToken(shop, idToken);
      return true;
    } catch (error) {
      console.error("Token exchange failed on page load", { shop, error });
      return false;
    }
  }

  return false;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<ReactElement> {
  const sp = await Promise.resolve(searchParams);
  const rawShop = firstString(sp.shop);
  const rawIdToken = firstString(sp.id_token);

  const { shop, idToken } = await resolveShop(rawShop, rawIdToken);

  if (shop) {
    await getOrCreateSession(shop, idToken);
  }

  return <ComingSoonPage title="Home" />;
}
