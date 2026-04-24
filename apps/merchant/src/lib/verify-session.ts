import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";

import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";
import { ensureFreshToken } from "@/lib/token-refresh";
import { exchangeSessionToken } from "@/lib/token-exchange";

type SessionHandler = (req: NextRequest, session: Session) => Promise<NextResponse>;

/**
 * Wraps an API route handler with Shopify session verification.
 *
 * Flow (fast path — cache hit):
 *   1. Decode Bearer JWT → shop          (~0ms, in-memory)
 *   2. Look up session from LRU cache    (~0ms, in-memory)
 *   3. Call handler
 *
 * Flow (cold start — no session):
 *   1. Decode Bearer JWT → shop
 *   2. Cache miss → Redis miss → DB miss
 *   3. Token exchange with Shopify       (~150ms, one-time per shop)
 *   4. Session cached for future hits
 *   5. Call handler
 */
export function withSessionVerification(handler: SessionHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const bearerToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!bearerToken) {
      return NextResponse.json({ error: "Unauthorized", reauth: true }, { status: 401 });
    }

    try {
      const payload = await shopify.session.decodeSessionToken(bearerToken);
      const hostname = shopHostnameFromSessionTokenDest(payload.dest);
      const shop = shopify.utils.sanitizeShop(hostname, true);
      if (!shop) {
        return NextResponse.json({ error: "Invalid token", reauth: true }, { status: 401 });
      }

      const sessionId = shopify.session.getOfflineId(shop);
      let session = await getCachedSession(sessionId);

      // No session cached → exchange the session token for an offline access token.
      if (!session) {
        try {
          session = await exchangeSessionToken(shop, bearerToken);
        } catch (exchangeError) {
          console.error("Token exchange failed in API route", { shop, error: exchangeError });
          return NextResponse.json({ error: "Session not found", reauth: true }, { status: 401 });
        }
      }

      // Refresh expiring token if needed (no-op for non-expiring tokens).
      try {
        session = await ensureFreshToken(session);
      } catch (refreshError) {
        const message = refreshError instanceof Error ? refreshError.message : "";
        if (message === "REFRESH_TOKEN_EXPIRED" || message === "REFRESH_TOKEN_MISSING") {
          return NextResponse.json({ error: "Session expired", reauth: true }, { status: 401 });
        }
        throw refreshError;
      }

      return handler(req, session);
    } catch {
      return NextResponse.json({ error: "Invalid token", reauth: true }, { status: 401 });
    }
  };
}
