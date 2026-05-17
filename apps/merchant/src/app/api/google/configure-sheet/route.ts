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

  // Load existing config to detect which fields actually changed
  const existing = await db.googleSheetsIntegration.findUnique({
    where: { shop: ctx.shop },
    select: {
      spreadsheetId: true,
      sheetName: true,
      abandonedSheetName: true,
      selectedFields: true,
      layoutDesign: true,
      headerRowWritten: true,
    },
  });

  const isNewSpreadsheet = existing?.spreadsheetId !== spreadsheetId;
  const headerRelatedChanged =
    isNewSpreadsheet ||
    existing?.sheetName !== sheetName ||
    existing?.abandonedSheetName !== (abandonedSheetName ?? sheetName) ||
    existing?.layoutDesign !== layoutDesign ||
    JSON.stringify(existing?.selectedFields) !== JSON.stringify(selectedFields);

  // Validate spreadsheet accessibility only on first connection or spreadsheet change
  let spreadsheetTitle: string | undefined;
  if (isNewSpreadsheet || !existing?.headerRowWritten) {
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
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Persist settings immediately so the response is fast
  await db.googleSheetsIntegration.update({
    where: { shop: ctx.shop },
    data: {
      spreadsheetId,
      spreadsheetUrl,
      sheetName,
      abandonedSheetName: abandonedSheetName ?? sheetName,
      selectedFields: selectedFields ?? undefined,
      singleRowPerOrder,
      insertAtTop,
      autoSync,
      layoutDesign,
      importPreset,
      isEnabled,
      headerRowWritten: headerRelatedChanged ? true : existing?.headerRowWritten ?? false,
      lastSyncError: null,
    },
  });

  // Only re-write header rows when column mapping or design actually changed
  if (headerRelatedChanged) {
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
  }

  return NextResponse.json({ ok: true, spreadsheetTitle, spreadsheetUrl });
});
