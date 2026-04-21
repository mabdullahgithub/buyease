import { NextRequest, NextResponse } from "next/server";
import { RequestedTokenType } from "@shopify/shopify-api";
import { db } from "@buyease/db";
import { authenticateEmbeddedRequest } from "@/lib/embedded-auth";
import { EMBEDDED_HOST_PARAM_RE, SHOPIFY_EMBED_HOST_COOKIE } from "@/lib/embedded-app-url";
import { serializeSetCookie } from "@/lib/forward-set-cookies";
import { invalidateMerchantAppCache } from "@/lib/merchant-cache";
import { getShopify, shopifySessionStorage } from "@/lib/shopify";

function bearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Embedded apps (Shopify managed install): exchange App Bridge ID token for an
 * offline Admin API session — no OAuth redirect round trip.
 * https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/token-exchange
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = bearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization bearer token" }, { status: 401 });
    }

    let embedHostFromBody: string | undefined;
    if (request.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = (await request.json()) as { host?: unknown };
        if (typeof body.host === "string" && EMBEDDED_HOST_PARAM_RE.test(body.host)) {
          embedHostFromBody = body.host;
        }
      } catch {
        /* empty or invalid JSON body */
      }
    }

    const embedded = await authenticateEmbeddedRequest(request);
    if (!embedded) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const { session } = await getShopify().auth.tokenExchange({
      shop: embedded.shop,
      sessionToken: token,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    });

    await shopifySessionStorage.storeSession(session);

    await db.merchant.upsert({
      where: { shop: session.shop },
      update: { isActive: true, uninstalledAt: null },
      create: { shop: session.shop, isActive: true },
    });
    invalidateMerchantAppCache(session.shop);

    const secure = process.env.NODE_ENV === "production";
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append(
      "Set-Cookie",
      serializeSetCookie("shopify_session", session.id, {
        httpOnly: true,
        secure,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    );
    headers.append(
      "Set-Cookie",
      serializeSetCookie("shopify_shop", session.shop, {
        httpOnly: true,
        secure,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    );

    if (embedHostFromBody) {
      headers.append(
        "Set-Cookie",
        serializeSetCookie(SHOPIFY_EMBED_HOST_COOKIE, embedHostFromBody, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        })
      );
    }

    return new NextResponse(JSON.stringify({ ok: true, shop: session.shop }), { status: 200, headers });
  } catch (error) {
    console.error("[api/auth/token-exchange]", error);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 401 });
  }
}
