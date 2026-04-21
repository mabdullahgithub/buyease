import { NextRequest, NextResponse } from "next/server";
import { getShopify } from "@/lib/shopify";
import { validateShopDomain } from "@/lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const shop = validateShopDomain(request.nextUrl.searchParams.get("shop") ?? "");
    const returnToParam = request.nextUrl.searchParams.get("return_to");
    const returnTo = returnToParam?.startsWith("/") ? returnToParam : "/form-builder";

    if (!shop) {
      return NextResponse.redirect(new URL("/install?error=invalid_shop", request.url));
    }

    const authResponse = await getShopify().auth.begin({
      shop,
      callbackPath: "/api/auth",
      isOnline: false,
      rawRequest: request,
    });

    const redirectTo = authResponse.headers.get("Location");
    if (!redirectTo) {
      return NextResponse.redirect(new URL("/install?error=oauth_start_failed", request.url));
    }

    const response = NextResponse.redirect(redirectTo);
    response.cookies.set("shopify_return_to", returnTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/install?error=oauth_start_failed", request.url));
  }
}
