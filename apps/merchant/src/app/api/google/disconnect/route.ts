import { NextRequest, NextResponse } from "next/server";

import { db } from "@buyease/db";

import { decryptToken, revokeToken } from "@/lib/google-oauth";
import { withGuards } from "@/lib/middleware-stack";

export const POST = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop: ctx.shop },
    select: { googleAccessToken: true, googleRefreshToken: true },
  });

  if (integration) {
    // Revoking the refresh token automatically invalidates all associated access tokens,
    // so there is no need to revoke the access token separately.
    if (integration.googleRefreshToken) {
      try {
        const raw = decryptToken(integration.googleRefreshToken);
        await revokeToken(raw);
      } catch {
        // Ignore revocation errors — we still clear locally
      }
    }

    await db.googleSheetsIntegration.update({
      where: { shop: ctx.shop },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiresAt: null,
        googleEmail: null,
        isEnabled: false,
        headerRowWritten: false,
      },
    });
  }

  return NextResponse.json({ ok: true });
});
