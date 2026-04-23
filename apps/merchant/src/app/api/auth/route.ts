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
    const shopifyRes = (await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: "/api/auth/callback",
      isOnline: false,
      rawRequest: req,
    })) as Response;

    const location = shopifyRes.headers.get("Location");
    if (!location) {
      console.error("Auth start failed: missing Location on OAuth response");
      return NextResponse.json({ error: "OAuth initiation failed" }, { status: 500 });
    }

    const out = NextResponse.redirect(location, shopifyRes.status === 307 ? 307 : 302);
    const raw = shopifyRes.headers as Headers & { getSetCookie?: () => string[] };
    const list = typeof raw.getSetCookie === "function" ? raw.getSetCookie() : [];
    if (list.length > 0) {
      for (const cookie of list) {
        out.headers.append("Set-Cookie", cookie);
      }
    } else {
      const single = shopifyRes.headers.get("set-cookie");
      if (single) {
        out.headers.append("Set-Cookie", single);
      }
    }
    return out;
  } catch (error) {
    console.error("Auth start failed", error);
    return NextResponse.json({ error: "OAuth initiation failed" }, { status: 500 });
  }
}
