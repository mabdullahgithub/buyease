import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LRUCache } from "lru-cache";

import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// In-memory rate limiter: max 60 requests per IP per 60 seconds.
// Process-local — sufficient for single-instance deployments.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const _rateLimitCache = new LRUCache<string, number[]>({ max: 10_000, ttl: RATE_WINDOW_MS });

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (_rateLimitCache.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  _rateLimitCache.set(ip, [...recent, now]);
  return true;
}

const schema = z.object({
  shop: z.string().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/),
  sessionType: z.enum(["autocomplete", "geocode"]),
});

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false }, { status: 429, headers: CORS });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: CORS });
  }

  const { shop, sessionType } = parsed.data;

  try {
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

    // Early check before entering the transaction (optimistic fast path).
    if (Number(merchant.balance) < costUsd) {
      return NextResponse.json(
        { ok: false, error: "insufficient_balance" },
        { status: 402, headers: CORS },
      );
    }

    // Interactive transaction: balance decrement is conditional (WHERE balance >= costUsd)
    // and the usage log is only written when the decrement succeeds. This prevents both
    // negative balances and orphaned log entries under concurrent requests.
    const charged = await prisma.$transaction(async (tx) => {
      const result = await tx.merchant.updateMany({
        where: { shop, balance: { gte: costUsd } },
        data: { balance: { decrement: costUsd } },
      });

      if (result.count === 0) return false;

      await tx.googleAutocompleteUsageLog.create({
        data: { shop, sessionType, costUsd },
      });

      return true;
    });

    if (!charged) {
      return NextResponse.json(
        { ok: false, error: "insufficient_balance" },
        { status: 402, headers: CORS },
      );
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
