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
  abandonedSheetName: z.string().trim().min(1).max(100).optional(),
  selectedFields: z.array(z.string()).length(52).optional(),
  singleRowPerOrder: z.boolean().optional(),
  insertAtTop: z.boolean().optional(),
  autoSync: z.boolean().optional(),
  layoutDesign: z.string().optional(),
  importPreset: z.string().optional(),
  isEnabled: z.boolean(),
});

export const POST = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(configureSchema, body);
  if (!parsed.success) return parsed.response;

  const {
    spreadsheetId,
    sheetName,
    abandonedSheetName,
    selectedFields,
    singleRowPerOrder,
    insertAtTop,
    autoSync,
    layoutDesign,
    importPreset,
    isEnabled
  } = parsed.data;

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
  // Run both sheet writes in parallel when two distinct tabs are configured
  try {
    const headerPromises: Promise<void>[] = [
      ensureHeaderRow(accessToken, spreadsheetId, sheetName, selectedFields, layoutDesign),
    ];
    if (abandonedSheetName && abandonedSheetName !== sheetName) {
      headerPromises.push(
        ensureHeaderRow(accessToken, spreadsheetId, abandonedSheetName, selectedFields, layoutDesign),
      );
    }
    await Promise.all(headerPromises);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    return NextResponse.json(
      {
        error: `Could not write to sheet. Make sure the sheet tabs exist in your spreadsheet. ${msg}`,
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
      abandonedSheetName: abandonedSheetName ?? sheetName,
      selectedFields: selectedFields ? (selectedFields as any) : undefined,
      singleRowPerOrder,
      insertAtTop,
      autoSync,
      layoutDesign,
      importPreset,
      isEnabled,
      headerRowWritten: true,
      lastSyncError: null,
    },
  });

  return NextResponse.json({ ok: true, spreadsheetTitle, spreadsheetUrl });
});
