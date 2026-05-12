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
    // Revoke both tokens with Google (best-effort — don't block on failure)
    const tokensToRevoke = [integration.googleAccessToken, integration.googleRefreshToken]
      .filter(Boolean) as string[];

    await Promise.allSettled(
      tokensToRevoke.map(async (enc) => {
        try {
          const raw = decryptToken(enc);
          await revokeToken(raw);
        } catch {
          // Ignore revocation errors — we still clear locally
        }
      }),
    );

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
