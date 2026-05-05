import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withGuards } from "@/lib/middleware-stack";
import { formConfigLimiter } from "@/lib/rate-limit";
import { parseBody } from "@/lib/validation";

const sheetsSyncSchema = z.object({
  spreadsheetId: z.string().trim().min(1).max(255),
  sheetName: z.string().trim().min(1).max(100).optional(),
  syncDirection: z.enum(["push", "pull"]).default("push"),
});

export const POST = withGuards({ rateLimiter: formConfigLimiter }, async (req: NextRequest) => {
  const body = await req.json();
  const parsed = parseBody(sheetsSyncSchema, body);
  if (!parsed.success) return parsed.response;

  const _data = parsed.data;

  // TODO: Implement Google Sheets sync
  return NextResponse.json(
    { message: "Sheets sync not yet implemented" },
    { status: 501 },
  );
});
