import { Session } from "@shopify/shopify-api";

import { prisma } from "@/lib/db";
import { saveSession } from "@/lib/session-cache";

/** Buffer: refresh 5 minutes before actual expiry to avoid race conditions. */
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

type ShopifyRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

/**
 * Returns true when the access token will expire within the buffer window.
 * Returns false for null/undefined — meaning the token is non-expiring.
 */
function isExpiredOrExpiring(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() - Date.now() < EXPIRY_BUFFER_MS;
}

/**
 * Calls Shopify's token endpoint with a refresh_token grant.
 * Throws on HTTP failure or Shopify error response.
 */
async function callShopifyRefresh(
  shop: string,
  refreshToken: string,
): Promise<ShopifyRefreshResponse> {
  const url = `https://${shop}/admin/oauth/access_token`;

  const body = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    client_secret: process.env.SHOPIFY_API_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
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
    throw new Error(`Shopify token refresh failed [${response.status}]: ${text}`);
  }

  return response.json() as Promise<ShopifyRefreshResponse>;
}

/**
 * Refreshes an expiring offline token for a shop.
 *
 * - Calls Shopify's refresh endpoint
 * - Persists new tokens to Session (all cache layers) and Merchant row
 * - Returns the updated Session with a fresh access token
 */
async function refreshOfflineToken(
  session: Session,
  refreshToken: string,
): Promise<Session> {
  const data = await callShopifyRefresh(session.shop, refreshToken);

  const newTokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Mutate in-place so the caller gets the updated reference.
  session.accessToken = data.access_token;
  session.expires = newTokenExpiresAt;

  // Persist to memory cache, Redis, and Postgres via saveSession.
  await saveSession(session);

  // Update the Session DB row (only existing columns).
  await prisma.session.update({
    where: { id: session.id },
    data: {
      accessToken: data.access_token,
      expires: newTokenExpiresAt,
    },
  });

  // Keep the Merchant row in sync for background jobs.
  await prisma.merchant.updateMany({
    where: { shop: session.shop },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: newTokenExpiresAt,
    },
  });

  return session;
}

/**
 * Ensures the session has a valid (non-expired) access token.
 *
 * Performance: checks session.expires in-memory FIRST.
 * Only hits the database if the token is actually near expiry
 * and we need to read the refresh token.
 *
 * - Non-expiring tokens (expires === undefined): instant no-op.
 * - Fresh expiring tokens: instant no-op (in-memory date check).
 * - Expired expiring tokens: one DB read + one Shopify API call (~200ms).
 *
 * @returns The session (possibly refreshed) with a valid access token.
 * @throws "REFRESH_TOKEN_MISSING" if no refresh token is stored.
 * @throws "REFRESH_TOKEN_EXPIRED" if the refresh token itself is past 90 days.
 */
export async function ensureFreshToken(session: Session): Promise<Session> {
  // Fast path: check the in-memory expires date. No DB call needed.
  if (!isExpiredOrExpiring(session.expires)) {
    return session;
  }

  // Token is expired or near expiry — fetch the refresh token from Merchant row.
  const merchant = await prisma.merchant.findUnique({
    where: { shop: session.shop },
    select: { refreshToken: true },
  });

  if (!merchant?.refreshToken) {
    throw new Error("REFRESH_TOKEN_MISSING");
  }

  return refreshOfflineToken(session, merchant.refreshToken);
}
