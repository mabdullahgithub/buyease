import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const schema = z.object({
  shop: z.string().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/),
  sessionType: z.enum(["autocomplete", "geocode"]),
});

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: CORS });
  }

  const { shop, sessionType } = parsed.data;

  const [merchant, globalConfig] = await Promise.all([
    prisma.merchant.findUnique({ where: { shop }, select: { balance: true } }),
    prisma.googleAutocompleteGlobalConfig.findUnique({
      where: { id: 1 },
      select: { pricePerSession: true, pricePerGeocode: true },
    }),
  ]);

  if (!merchant) {
    return NextResponse.json({ ok: false }, { status: 404, headers: CORS });
  }

  const costUsd =
    sessionType === "autocomplete"
      ? Number(globalConfig?.pricePerSession ?? 0.05)
      : Number(globalConfig?.pricePerGeocode ?? 0.01);

  await prisma.$transaction([
    prisma.merchant.update({
      where: { shop },
      data: { balance: { decrement: costUsd } },
    }),
    prisma.googleAutocompleteUsageLog.create({
      data: { shop, sessionType, costUsd },
    }),
  ]);

  return NextResponse.json({ ok: true }, { headers: CORS });
}
