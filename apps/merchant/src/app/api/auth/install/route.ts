import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { validateShopDomain } from "@/lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const shop = validateShopDomain(request.nextUrl.searchParams.get("shop") ?? "");

    if (!shop) {
      return NextResponse.redirect(new URL("/install?error=invalid_shop", request.url));
    }

    const authResponse = await shopify.auth.begin({
      shop,
      callbackPath: "/api/auth",
      isOnline: false,
      rawRequest: request,
    });

    const redirectTo = authResponse.headers.get("Location");
    if (!redirectTo) {
      return NextResponse.redirect(new URL("/install?error=oauth_start_failed", request.url));
    }

    return NextResponse.redirect(redirectTo);
  } catch {
    return NextResponse.redirect(new URL("/install?error=oauth_start_failed", request.url));
  }
}
