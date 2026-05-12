import { NextRequest, NextResponse } from "next/server";

import { buildAuthUrl, buildOAuthState } from "@/lib/google-oauth";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const state = buildOAuthState(ctx.shop);
  const authUrl = buildAuthUrl(state);
  return NextResponse.json({ authUrl });
});
