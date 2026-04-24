import { Session } from "@shopify/shopify-api";

import { prisma } from "@/lib/db";
import { saveSession } from "@/lib/session-cache";
import shopify from "@/lib/shopify";

type TokenExchangeResponse = {
  access_token: string;
  scope: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

/**
 * Exchanges a Shopify session token (JWT from App Bridge) for an expiring offline access token.
 * This replaces the old redirect-based OAuth flow entirely.
 *
 * Per Shopify's December 2025 deprecation notice, all new tokens must be expiring.
 * We pass `expiring=1` to get a token with:
 *   - access_token  (1-hour lifetime)
 *   - refresh_token (90-day lifetime, for background refresh)
 *
 * Flow:
 *   1. One POST to Shopify (~150ms)
 *   2. Persist session to memory cache, Redis, and Postgres
 *   3. Upsert the Merchant row with token + refresh metadata
 *   4. Register webhooks in the background (non-blocking)
 */
export async function exchangeSessionToken(
  shop: string,
  sessionToken: string,
): Promise<Session> {
  const url = `https://${shop}/admin/oauth/access_token`;

  const body = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    client_secret: process.env.SHOPIFY_API_SECRET!,
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    subject_token: sessionToken,
    subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
    expiring: "1",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed [${response.status}]: ${text}`);
  }

  const data = (await response.json()) as TokenExchangeResponse;

  const sessionId = shopify.session.getOfflineId(shop);
  const now = Date.now();
  const expiresAt = data.expires_in
    ? new Date(now + data.expires_in * 1000)
    : undefined;

  const session = new Session({
    id: sessionId,
    shop,
    state: "",
    isOnline: false,
    scope: data.scope,
    accessToken: data.access_token,
    expires: expiresAt,
  });

  // Persist session to all three cache layers (memory → Redis → Postgres).
  await saveSession(session);

  // Upsert merchant row with the new token + refresh token data.
  await prisma.merchant.upsert({
    where: { shop },
    create: {
      shop,
      isActive: true,
      accessToken: data.access_token,
      scopes: data.scope,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      ...(expiresAt ? { tokenExpiresAt: expiresAt } : {}),
    },
    update: {
      isActive: true,
      uninstalledAt: null,
      accessToken: data.access_token,
      scopes: data.scope,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      ...(expiresAt ? { tokenExpiresAt: expiresAt } : {}),
    },
  });

  // Register webhooks in the background — non-blocking for speed.
  // Shopify's managed install already registers declarative webhooks from shopify.app.toml,
  // but this is a safety net for any that were missed.
  void shopify.webhooks.register({ session }).catch((error: unknown) => {
    console.error("Background webhook registration failed", { shop, error });
  });

  return session;
}
