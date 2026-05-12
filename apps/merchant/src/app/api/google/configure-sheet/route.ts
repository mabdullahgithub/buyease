import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@buyease/db";

import { getValidAccessToken } from "@/lib/google-oauth";
import { ensureHeaderRow, getSpreadsheetTitle } from "@/lib/google-sheets";
import { withGuards } from "@/lib/middleware-stack";
import { parseBody } from "@/lib/validation";

const configureSchema = z.object({
  spreadsheetId: z.string().trim().min(1).max(255),
  sheetName: z.string().trim().min(1).max(100).default("Orders"),
  isEnabled: z.boolean(),
});

export const POST = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(configureSchema, body);
  if (!parsed.success) return parsed.response;

  const { spreadsheetId, sheetName, isEnabled } = parsed.data;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(ctx.shop);
  } catch {
    return NextResponse.json(
      { error: "Google account not connected. Please sign in with Google first." },
      { status: 400 },
    );
  }

  // Validate that the spreadsheet exists and is accessible
  let spreadsheetTitle: string;
  try {
    spreadsheetTitle = await getSpreadsheetTitle(accessToken, spreadsheetId);
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not access this Google Sheet. Make sure the Sheet ID is correct and your Google account has edit access to it.",
      },
      { status: 400 },
    );
  }

  // Write header row now so first-time setup is visible immediately
  try {
    await ensureHeaderRow(accessToken, spreadsheetId, sheetName);
  } catch {
    return NextResponse.json(
      {
        error: `Could not write to sheet "${sheetName}". Make sure the sheet tab exists in your spreadsheet.`,
      },
      { status: 400 },
    );
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  await db.googleSheetsIntegration.update({
    where: { shop: ctx.shop },
    data: {
      spreadsheetId,
      spreadsheetUrl,
      sheetName,
      isEnabled,
      headerRowWritten: true,
      lastSyncError: null,
    },
  });

  return NextResponse.json({ ok: true, spreadsheetTitle, spreadsheetUrl });
});
