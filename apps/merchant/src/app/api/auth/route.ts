import { NextRequest, NextResponse } from "next/server";

import shopify from "@/lib/shopify";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  let sanitizedShop: string | null = null;
  try {
    sanitizedShop = shopify.utils.sanitizeShop(shop, true);
  } catch {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400 });
  }

  if (!sanitizedShop) {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400 });
  }

  try {
    const { url } = await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: "/api/auth/callback",
      isOnline: false,
      rawRequest: req,
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Auth start failed", error);
    return NextResponse.json({ error: "OAuth initiation failed" }, { status: 500 });
  }
}
