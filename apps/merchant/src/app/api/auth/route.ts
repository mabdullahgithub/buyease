import { NextRequest, NextResponse } from "next/server";
import { getShopify } from "@/lib/shopify";
import { db } from "@buyease/db";
import { collectSetCookieLines, redirectWithSetCookies, serializeSetCookie } from "@/lib/forward-set-cookies";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const returnToCookie = request.cookies.get("shopify_return_to")?.value;
    const returnTo = returnToCookie?.startsWith("/") ? returnToCookie : "/form-builder";

    const callbackResponse = await getShopify().auth.callback({
      rawRequest: request,
    });

    const session = callbackResponse.session;

    await db.merchant.upsert({
      where: { shop: session.shop },
      update: { isActive: true, uninstalledAt: null },
      create: { shop: session.shop, isActive: true },
    });

    const headersLike = callbackResponse.headers as unknown as Headers;
    const setCookieLines = collectSetCookieLines(headersLike);
    const secure = process.env.NODE_ENV === "production";
    setCookieLines.push(
      serializeSetCookie("shopify_session", session.id, {
        httpOnly: true,
        secure,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }),
      serializeSetCookie("shopify_shop", session.shop, {
        httpOnly: true,
        secure,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }),
      serializeSetCookie("shopify_return_to", "", {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      })
    );

    return redirectWithSetCookies(new URL(returnTo, request.url), setCookieLines);
  } catch (error) {
    console.error("[api/auth] OAuth callback failed", error);
    return NextResponse.redirect(
      new URL("/install?error=oauth_callback_failed", request.url)
    );
  }
}
