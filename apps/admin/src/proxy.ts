import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { canAccessPath, isValidAdminRole } from "@/lib/admin-access";
import { getClientIpFromHeaders, getEnvAllowlistIps, getEnvBlockedIps } from "@/lib/admin-network";

const PUBLIC_PATHS = new Set(["/login", "/forgot-password", "/reset-password"]);

function getClientIp(request: NextRequest): string {
  return getClientIpFromHeaders(request.headers);
}

function isIpAllowed(request: NextRequest): boolean {
  const blocked = getEnvBlockedIps();
  const clientIp = getClientIp(request);
  if (clientIp && blocked.has(clientIp)) return false;

  const allowlist = getEnvAllowlistIps();
  if (allowlist.size === 0) return true;
  return !!clientIp && allowlist.has(clientIp);
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user?.role;
  const hasValidRole = isValidAdminRole(role);
  const hasValidSession = !!request.auth && hasValidRole;

  if (!isIpAllowed(request)) {
    return new NextResponse(null, { status: 403 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.has(pathname);
  const isProtected = pathname.startsWith("/api/admin") || !isPublic;

  if (isProtected && !hasValidSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasValidSession && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (hasValidSession && !canAccessPath(pathname, role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
