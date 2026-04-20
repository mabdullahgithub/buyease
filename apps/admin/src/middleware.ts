import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS ?? "127.0.0.1,::1")
  .split(",")
  .map((ip) => ip.trim());

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/forgot-password")) return true;
  if (pathname.startsWith("/reset-password")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname === "/api/admin/auth/forgot-password") return true;
  if (pathname === "/api/admin/auth/reset-password") return true;
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1"
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!isPublicPath(pathname)) {
    const clientIp = getClientIp(request);
    if (!ALLOWED_IPS.includes(clientIp)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
