import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";

import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";

type SessionHandler = (req: NextRequest, session: Session) => Promise<NextResponse>;

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

      const session = await getCachedSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found", reauth: true }, { status: 401 });
      }

      if (!session.isActive(shopify.config.scopes)) {
        return NextResponse.json({ error: "Scopes mismatch", reauth: true }, { status: 401 });
      }

      return handler(req, session);
    } catch {
      return NextResponse.json({ error: "Invalid token", reauth: true }, { status: 401 });
    }
  };
}
