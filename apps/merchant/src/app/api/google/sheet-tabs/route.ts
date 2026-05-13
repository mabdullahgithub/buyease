import { NextRequest, NextResponse } from "next/server";

import { getValidAccessToken } from "@/lib/google-oauth";
import { getSheetTabs, getSpreadsheetTitle } from "@/lib/google-sheets";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get("spreadsheetId")?.trim();

  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId is required" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(ctx.shop);
  } catch {
    return NextResponse.json({ error: "Google account not connected." }, { status: 400 });
  }

  try {
    const tabs = await getSheetTabs(accessToken, spreadsheetId);
    let title = "Untitled spreadsheet";
    try {
      title = await getSpreadsheetTitle(accessToken, spreadsheetId);
    } catch {
      // Ignore title fetch error
    }
    return NextResponse.json({ tabs, title });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not access this spreadsheet. Check the ID is correct and your Google account has edit access.",
      },
      { status: 400 },
    );
  }
});
