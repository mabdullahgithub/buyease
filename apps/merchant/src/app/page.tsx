import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import { InstallOAuthGate } from "@/app/install-oauth-gate";
import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";

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

export default async function HomePage({ searchParams }: HomePageProps): Promise<ReactElement> {
  const sp = await Promise.resolve(searchParams);
  const shop = firstString(sp.shop);
  const host = firstString(sp.host);

  if (shop) {
    try {
      const sanitizedShop = shopify.utils.sanitizeShop(shop, true);
      if (sanitizedShop) {
        const sessionId = shopify.session.getOfflineId(sanitizedShop);
        const session = await getCachedSession(sessionId);
        if (!session) {
          const auth = new URLSearchParams({ shop: sanitizedShop });
          if (host) auth.set("host", host);
          redirect(`/api/auth?${auth.toString()}`);
        }
      }
    } catch {
      // invalid shop — fall through to static shell
    }
  } else {
    const idToken = firstString(sp.id_token);
    if (idToken) {
      try {
        const payload = await shopify.session.decodeSessionToken(idToken);
        const hostname = shopHostnameFromSessionTokenDest(payload.dest);
        const sanitizedShop = shopify.utils.sanitizeShop(hostname, true);
        if (sanitizedShop) {
          const sessionId = shopify.session.getOfflineId(sanitizedShop);
          const session = await getCachedSession(sessionId);
          if (!session) {
            const auth = new URLSearchParams({ shop: sanitizedShop });
            if (host) auth.set("host", host);
            redirect(`/api/auth?${auth.toString()}`);
          }
        }
      } catch {
        // invalid or expired session token
      }
    }
  }

  return (
    <main>
      <InstallOAuthGate />
      <h1>COD Form &amp; Upsells</h1>
      <p>Phase 1 foundation is configured. Continue setup from Billing and Auth routes.</p>
      {!shop && !firstString(sp.id_token) ? (
        <p style={{ marginTop: 16, opacity: 0.85 }}>
          Open this app from the Shopify admin so installation can finish and your store is saved.
        </p>
      ) : null}
    </main>
  );
}
