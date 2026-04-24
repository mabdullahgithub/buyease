import Link from "next/link";
import type { ReactElement } from "react";

import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";
import { exchangeSessionToken } from "@/lib/token-exchange";

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

  // No session — exchange the id_token for an offline access token.
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
  const host = firstString(sp.host);

  const { shop, idToken } = await resolveShop(rawShop, rawIdToken);

  const embeddedQs = new URLSearchParams();
  if (shop) embeddedQs.set("shop", shop);
  if (host) embeddedQs.set("host", host);
  const embeddedSuffix = embeddedQs.toString() ? `?${embeddedQs.toString()}` : "";

  let connectedShop: string | null = null;

  if (shop) {
    const hasSession = await getOrCreateSession(shop, idToken);
    if (hasSession) {
      connectedShop = shop;
    }
  }

  return (
    <main style={{ maxWidth: 560 }}>
      <h1>COD Form &amp; Upsells</h1>
      {connectedShop ? (
        <>
          <p>
            <strong>{connectedShop}</strong> is connected. Use the sections below from the Shopify admin
            (embedded links keep <code>shop</code> and <code>host</code> in the URL).
          </p>
          <ul>
            <li>
              <Link href={`/form-builder${embeddedSuffix}`}>Form builder</Link>
            </li>
            <li>
              <Link href={`/billing${embeddedSuffix}`}>Billing</Link>
            </li>
            <li>
              <Link href={`/settings${embeddedSuffix}`}>Settings</Link>
            </li>
          </ul>
        </>
      ) : (
        <>
          <p>Phase 1 foundation is configured. Continue setup from Billing and Auth routes.</p>
          {!shop && (
            <p style={{ marginTop: 16, opacity: 0.85 }}>
              Open this app from the Shopify admin so installation can finish and your store is saved.
            </p>
          )}
        </>
      )}
    </main>
  );
}
