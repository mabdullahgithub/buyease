import { NextRequest, NextResponse } from "next/server";

import { db } from "@buyease/db";

import { getValidAccessToken } from "@/lib/google-oauth";
import { createSpreadsheet, ensureHeaderRow } from "@/lib/google-sheets";
import { withGuards } from "@/lib/middleware-stack";

export const POST = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(ctx.shop);
  } catch {
    return NextResponse.json(
      { error: "Google account not connected. Please sign in with Google first." },
      { status: 400 },
    );
  }

  let spreadsheetId: string;
  let spreadsheetUrl: string;
  let spreadsheetTitle: string;
  try {
    const result = await createSpreadsheet(accessToken, "BuyEase Orders");
    spreadsheetId = result.spreadsheetId;
    spreadsheetUrl = result.spreadsheetUrl;
    spreadsheetTitle = result.title;
  } catch {
    return NextResponse.json(
      { error: "Failed to create a new Google Sheet. Please check your Google account permissions." },
      { status: 500 },
    );
  }

  // Write header row immediately
  try {
    await ensureHeaderRow(accessToken, spreadsheetId, "Orders");
  } catch {
    // Non-critical — sheet exists, header can be added later
  }

  await db.googleSheetsIntegration.update({
    where: { shop: ctx.shop },
    data: {
      spreadsheetId,
      spreadsheetUrl,
      sheetName: "Orders",
      isEnabled: true,
      headerRowWritten: true,
      lastSyncError: null,
    },
  });

  return NextResponse.json({ ok: true, spreadsheetId, spreadsheetUrl, spreadsheetTitle });
});
