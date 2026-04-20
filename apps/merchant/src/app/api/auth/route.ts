import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { db } from "@buyease/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const returnToCookie = request.cookies.get("shopify_return_to")?.value;
    const returnTo = returnToCookie?.startsWith("/") ? returnToCookie : "/form-builder";

    const callbackResponse = await shopify.auth.callback({
      rawRequest: request,
    });

    const session = callbackResponse.session;

    await db.merchant.upsert({
      where: { shop: session.shop },
      update: { isActive: true, uninstalledAt: null },
      create: { shop: session.shop, isActive: true },
    });

    const response = NextResponse.redirect(new URL(returnTo, request.url));

    response.cookies.set("shopify_session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("shopify_shop", session.shop, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete("shopify_return_to");

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/install?error=oauth_callback_failed", request.url)
    );
  }
}
