import { NextRequest, NextResponse } from "next/server";
import { db } from "@buyease/db";

/**
 * Lightweight check so the embedded bootstrap can skip token exchange when
 * `shopify_session` is already present (avoids redundant round trips).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.cookies.get("shopify_session")?.value;
  const hasSession = Boolean(sessionId);
  if (!sessionId) {
    return NextResponse.json({ hasSession: false, hasActiveMerchant: false }, { status: 200 });
  }

  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: { shop: true },
  });

  if (!session) {
    return NextResponse.json({ hasSession: false, hasActiveMerchant: false }, { status: 200 });
  }

  const merchant = await db.merchant.findUnique({
    where: { shop: session.shop },
    select: { isActive: true },
  });

  return NextResponse.json(
    {
      hasSession,
      hasActiveMerchant: Boolean(merchant?.isActive),
    },
    { status: 200 }
  );
}
