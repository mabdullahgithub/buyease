import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight check so the embedded bootstrap can skip token exchange when
 * `shopify_session` is already present (avoids redundant round trips).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasSession = Boolean(request.cookies.get("shopify_session")?.value);
  return NextResponse.json({ hasSession }, { status: 200 });
}
