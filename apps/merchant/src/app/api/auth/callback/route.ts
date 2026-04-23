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

    const webhookResponse = await shopify.webhooks.register({ session });
    for (const [topic, results] of Object.entries(webhookResponse)) {
      for (const result of results) {
        if (!result.success) {
          console.error("Webhook registration failed", { topic, result });
        }
      }
    }

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
    console.error("Auth callback failed", { code, error });
    return NextResponse.json(
      { error: "Authentication failed", code },
      { status: code === "oauth_state_missing" ? 400 : 500 },
    );
  }
}
