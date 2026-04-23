import { NextRequest, NextResponse } from "next/server";

import { getCachedSession } from "@/lib/session-cache";
import { shopHostnameFromSessionTokenDest } from "@/lib/shop-domain";
import shopify from "@/lib/shopify";

async function existsForSanitizedShop(sanitized: string): Promise<boolean> {
  const session = await getCachedSession(shopify.session.getOfflineId(sanitized));
  return !!session;
}

/** Fast path: shop in query string (no body, no preflight). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  let sanitized: string | null = null;
  try {
    sanitized = shopify.utils.sanitizeShop(shop, true);
  } catch {
    return NextResponse.json({ exists: false, shop: null as string | null });
  }

  if (!sanitized) {
    return NextResponse.json({ exists: false, shop: null as string | null });
  }

  const exists = await existsForSanitizedShop(sanitized);
  return NextResponse.json({ exists, shop: sanitized });
}

/**
 * Shopify session token (`id_token`) can exceed safe URL lengths; verify with
 * `shopify.session.decodeSessionToken` (HMAC, audience) per Shopify rules.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { shop?: string; id_token?: string };
  try {
    body = (await req.json()) as { shop?: string; id_token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let sanitized: string | null = null;

  if (body.shop) {
    try {
      sanitized = shopify.utils.sanitizeShop(body.shop, true);
    } catch {
      return NextResponse.json({ exists: false, shop: null as string | null });
    }
  } else if (body.id_token) {
    try {
      const payload = await shopify.session.decodeSessionToken(body.id_token);
      const hostname = shopHostnameFromSessionTokenDest(payload.dest);
      sanitized = shopify.utils.sanitizeShop(hostname, true);
    } catch {
      return NextResponse.json({ exists: false, shop: null as string | null });
    }
  } else {
    return NextResponse.json({ error: "Missing shop or id_token" }, { status: 400 });
  }

  if (!sanitized) {
    return NextResponse.json({ exists: false, shop: null as string | null });
  }

  const exists = await existsForSanitizedShop(sanitized);
  return NextResponse.json({ exists, shop: sanitized });
}
