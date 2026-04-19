import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api/auth",
  "/api/webhooks",
  "/(auth)",
  "/install",
  "/callback",
];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname.startsWith(p) || pathname === "/"
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const shop = req.cookies.get("shopify_session")?.value;
  if (!shop) {
    const installUrl = new URL("/install", req.url);
    installUrl.searchParams.set("return_to", pathname);
    return NextResponse.redirect(installUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
