import { NextRequest, NextResponse } from "next/server";

import { exportAllOrdersToSheet } from "@/lib/google-sheets";
import { withGuards } from "@/lib/middleware-stack";

export const POST = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  try {
    const result = await exportAllOrdersToSheet(ctx.shop);
    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
