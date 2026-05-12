import { NextRequest, NextResponse } from "next/server";

import { buildAuthUrl, buildOAuthState, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "@/lib/google-oauth";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI environment variables." },
      { status: 503 },
    );
  }

  const state = buildOAuthState(ctx.shop);
  const authUrl = buildAuthUrl(state);
  return NextResponse.json({ authUrl });
});
