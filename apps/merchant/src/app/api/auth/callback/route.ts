import { NextRequest, NextResponse } from "next/server";

import {
  BotActivityDetected,
  CookieNotFound,
  InvalidOAuthError,
  ShopifyError,
} from "@shopify/shopify-api";

import { prisma } from "@/lib/db";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { saveSession } from "@/lib/session-cache";
import shopify from "@/lib/shopify";
import { toShopifyAuthRequest } from "@/lib/shopify-auth-request";

function oauthErrorCode(error: unknown): string {
  if (error instanceof CookieNotFound) return "oauth_state_missing";
  if (error instanceof InvalidOAuthError) return "oauth_invalid";
  if (error instanceof BotActivityDetected) return "oauth_bot";
  if (error instanceof ShopifyError) return "shopify_error";
  return "unknown";
}

/**
 * OAuth callback — fallback route for authorization code grant.
 *
 * The primary auth flow uses token exchange (no redirects).
 * This route exists only as a fallback for edge cases where
 * Shopify redirects through the traditional OAuth flow.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { session } = await shopify.auth.callback({
      rawRequest: toShopifyAuthRequest(req),
    });

    await saveSession(session);

    await prisma.merchant.upsert({
      where: { shop: session.shop },
      create: {
        shop: session.shop,
        isActive: true,
        accessToken: session.accessToken ?? null,
        scopes: session.scope ?? null,
      },
      update: {
        isActive: true,
        uninstalledAt: null,
        accessToken: session.accessToken ?? null,
        scopes: session.scope ?? null,
      },
    });

    // Register webhooks in the background — non-blocking.
    void shopify.webhooks.register({ session }).catch((error: unknown) => {
      console.error("Webhook registration failed", { shop: session.shop, error });
    });

    const host = req.nextUrl.searchParams.get("host");

    if (host) {
      const sanitizedHost = shopify.utils.sanitizeHost(host);
      if (sanitizedHost) {
        const decodedHost = Buffer.from(sanitizedHost, "base64").toString("utf8");
        return NextResponse.redirect(
          `https://${decodedHost}/apps/${process.env.SHOPIFY_API_KEY}`,
        );
      }
    }

    return NextResponse.redirect(
      `${merchantAppOrigin()}/?shop=${session.shop}&host=${host ?? ""}`,
    );
  } catch (error) {
    const code = oauthErrorCode(error);
    const message = error instanceof Error ? error.message : String(error);
    console.error("Auth callback failed", {
      code,
      message,
      errorName: error instanceof Error ? error.constructor.name : typeof error,
    });
    return NextResponse.json(
      { error: "Authentication failed", code },
      { status: code === "oauth_state_missing" ? 400 : 500 },
    );
  }
}
