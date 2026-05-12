import { NextRequest, NextResponse } from "next/server";

import { getValidAccessToken, listSpreadsheets } from "@/lib/google-oauth";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(ctx.shop);
  } catch {
    return NextResponse.json({ error: "Google account not connected." }, { status: 400 });
  }

  try {
    const spreadsheets = await listSpreadsheets(accessToken);
    return NextResponse.json({ spreadsheets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("403")) {
      // "accessNotConfigured" means Google Drive API is not enabled in the GCP project.
      // "forbidden" means the OAuth token lacks the drive scope — user must reconnect.
      const driveApiNotEnabled =
        msg.includes("accessNotConfigured") || msg.includes("has not been used in project");
      if (driveApiNotEnabled) {
        return NextResponse.json(
          {
            error:
              "Google Drive API is not enabled for this app. Please contact support or enable it in Google Cloud Console.",
            needsDriveApiEnabled: true,
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        {
          error:
            "Drive access not granted. Disconnect and reconnect your Google account to allow spreadsheet listing.",
          needsReauth: true,
        },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Could not list your spreadsheets. Please try again." },
      { status: 400 },
    );
  }
});
