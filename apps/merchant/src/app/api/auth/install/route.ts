import { NextRequest, NextResponse } from "next/server";
import { getShopify } from "@/lib/shopify";
import { validateShopDomain } from "@/lib/auth";
import { collectSetCookieLines, redirectWithSetCookies, serializeSetCookie } from "@/lib/forward-set-cookies";

function installErrorRedirect(
  request: NextRequest,
  code: "invalid_shop" | "oauth_start_failed" | "shop_context_required",
  opts: { shop?: string | null; returnTo?: string; host?: string | null }
): NextResponse {
  const url = new URL("/install", request.url);
  url.searchParams.set("error", code);
  if (opts.returnTo?.startsWith("/")) {
    url.searchParams.set("return_to", opts.returnTo);
  }
  if (opts.shop) {
    url.searchParams.set("shop", opts.shop);
  }
  if (opts.host) {
    url.searchParams.set("host", opts.host);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const returnToParam = request.nextUrl.searchParams.get("return_to");
  const returnTo = returnToParam?.startsWith("/") ? returnToParam : "/overview";
  const shopParam = request.nextUrl.searchParams.get("shop") ?? "";
  const hostParam = request.nextUrl.searchParams.get("host");

  try {
    if (!shopParam) {
      return installErrorRedirect(request, "shop_context_required", { returnTo, host: hostParam });
    }

    const shop = validateShopDomain(shopParam);

    if (!shop) {
      return installErrorRedirect(request, "invalid_shop", { returnTo, host: hostParam });
    }

    const authResponse = await getShopify().auth.begin({
      shop,
      callbackPath: "/api/auth",
      isOnline: false,
      rawRequest: request,
    });

    const redirectTo = authResponse.headers.get("Location");
    if (!redirectTo) {
      console.error("[api/auth/install] auth.begin returned no Location header");
      return installErrorRedirect(request, "oauth_start_failed", { shop, returnTo, host: hostParam });
    }

    // `auth.begin` returns Set-Cookie headers (OAuth state). Next.js `cookies.set` wipes any
    // Set-Cookie appended only to `headers` — merge everything into one redirect response.
    const setCookieLines = collectSetCookieLines(authResponse);
    setCookieLines.push(
      serializeSetCookie("shopify_return_to", returnTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      })
    );
    return redirectWithSetCookies(redirectTo, setCookieLines);
  } catch (error) {
    console.error("[api/auth/install] OAuth start failed", error);
    const normalizedOnError = validateShopDomain(shopParam);
    return installErrorRedirect(request, "oauth_start_failed", {
      shop: normalizedOnError ?? undefined,
      returnTo,
      host: hostParam,
    });
  }
}
