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

    // Webhooks are declared in shopify.app.toml (Partner / CLI). Runtime
    // shopify.webhooks.register() calls Admin GraphQL and returns 403 without
    // webhook-management scopes — TOML subscriptions do not need this call.

    const host = req.nextUrl.searchParams.get("host");
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
