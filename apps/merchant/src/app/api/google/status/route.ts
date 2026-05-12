import { NextRequest, NextResponse } from "next/server";

import { db } from "@buyease/db";

import { withGuards } from "@/lib/middleware-stack";

export type GoogleSheetsStatus =
  | { connected: false }
  | {
      connected: true;
      email: string;
      spreadsheetId: string | null;
      spreadsheetUrl: string | null;
      sheetName: string;
      isEnabled: boolean;
      lastSyncAt: string | null;
      lastSyncError: string | null;
    };

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop: ctx.shop },
    select: {
      googleEmail: true,
      googleRefreshToken: true,
      spreadsheetId: true,
      spreadsheetUrl: true,
      sheetName: true,
      isEnabled: true,
      lastSyncAt: true,
      lastSyncError: true,
    },
  });

  if (!integration?.googleRefreshToken) {
    return NextResponse.json<GoogleSheetsStatus>({ connected: false });
  }

  return NextResponse.json<GoogleSheetsStatus>({
    connected: true,
    email: integration.googleEmail ?? "",
    spreadsheetId: integration.spreadsheetId,
    spreadsheetUrl: integration.spreadsheetUrl,
    sheetName: integration.sheetName,
    isEnabled: integration.isEnabled,
    lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
    lastSyncError: integration.lastSyncError,
  });
});
