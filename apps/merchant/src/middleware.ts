import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api/auth",
  "/api/auth/install",
  "/api/webhooks",
  "/install",
  "/api/health",
];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionId = req.cookies.get("shopify_session")?.value;
  if (!sessionId) {
    const installUrl = new URL("/install", req.url);
    installUrl.searchParams.set("return_to", pathname);

    const queryShop = req.nextUrl.searchParams.get("shop");
    if (queryShop) {
      installUrl.searchParams.set("shop", queryShop);
    }

    return NextResponse.redirect(installUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/form-builder", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
