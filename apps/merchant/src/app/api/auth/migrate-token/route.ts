import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { prisma } from "@/lib/db";
import shopify from "@/lib/shopify";

const MigrateSchema = z.object({
  secret: z.string().min(1),
  shop: z.string().optional(),
});

type ShopifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

/**
 * Exchanges a non-expiring offline token for an expiring one.
 * Irreversible per shop — the original token is revoked by Shopify.
 */
async function migrateShopToken(shop: string, oldAccessToken: string): Promise<void> {
  const url = `https://${shop}/admin/oauth/access_token`;

  const body = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    client_secret: process.env.SHOPIFY_API_SECRET!,
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    subject_token: oldAccessToken,
    subject_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
    requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
    expiring: "1",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token migration failed [${response.status}]: ${text}`);
  }

  const data = (await response.json()) as ShopifyTokenResponse;
  const newTokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  const sessionId = shopify.session.getOfflineId(shop);
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      accessToken: data.access_token,
      expires: newTokenExpiresAt,
    },
  });

  await prisma.merchant.updateMany({
    where: { shop },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: newTokenExpiresAt,
    },
  });
}

/**
 * POST /api/auth/migrate-token
 *
 * One-time migration: exchanges non-expiring offline tokens for expiring ones.
 * Secured by INTERNAL_MIGRATION_SECRET env variable.
 *
 * Body: { secret: string, shop?: string }
 *
 * Irreversible per shop — the original non-expiring token is revoked by Shopify.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof MigrateSchema>;

  try {
    const raw = await req.json();
    body = MigrateSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.secret !== process.env.INTERNAL_MIGRATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = {
    isActive: true,
    tokenExpiresAt: null,
    accessToken: { not: null },
    ...(body.shop ? { shop: body.shop } : {}),
  } as const;

  const merchants = await prisma.merchant.findMany({
    where,
    select: { shop: true, accessToken: true },
  });

  if (merchants.length === 0) {
    return NextResponse.json({ migrated: 0, message: "No shops to migrate" });
  }

  const results: { shop: string; status: "ok" | "error"; error?: string }[] = [];

  for (const merchant of merchants) {
    if (!merchant.accessToken) continue;

    try {
      await migrateShopToken(merchant.shop, merchant.accessToken);
      results.push({ shop: merchant.shop, status: "ok" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ shop: merchant.shop, status: "error", error: message });
    }
  }

  const migrated = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ migrated, failed, results });
}
