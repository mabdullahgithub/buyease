import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { db } from "@buyease/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");

    if (!shop || !code) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const callbackResponse = await shopify.auth.callback({
      rawRequest: request,
    });

    const session = callbackResponse.session;

    await db.merchant.upsert({
      where: { shop: session.shop },
      update: { isActive: true, uninstalledAt: null },
      create: { shop: session.shop, isActive: true },
    });

    const response = NextResponse.redirect(
      new URL(`/dashboard?shop=${session.shop}`, request.url)
    );

    response.cookies.set("shopify_session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("[auth/callback] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
