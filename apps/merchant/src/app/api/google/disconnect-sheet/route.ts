import { NextRequest, NextResponse } from "next/server";

import { db } from "@buyease/db";

import { withGuards } from "@/lib/middleware-stack";

export const POST = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  await db.googleSheetsIntegration.update({
    where: { shop: ctx.shop },
    data: {
      spreadsheetId: null,
      spreadsheetUrl: null,
      sheetName: "Orders",
      abandonedSheetName: "Orders",
      isEnabled: false,
      headerRowWritten: false,
    },
  });

  return NextResponse.json({ ok: true });
});
