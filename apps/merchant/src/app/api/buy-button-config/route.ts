import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { buyButtonConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import {
  getCachedAdminButtonConfig,
  setCachedAdminButtonConfig,
} from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

const BUTTON_SELECT = {
  buttonText:      true,
  buttonSubtitle:  true,
  iconId:          true,
  iconAlign:       true,
  showIcon:        true,
  animation:       true,
  stickyPosition:  true,
  stickyMobile:    true,
  mobileFullWidth: true,
  bgColor:         true,
  textColor:       true,
  borderColor:     true,
  fontSizePx:      true,
  borderRadiusPx:  true,
  borderWidthPx:   true,
  shadowStrength:  true,
  widthPercent:    true,
  isBold:          true,
  isItalic:        true,
  isVisible:       true,
  updatedAt:       true,
} as const;

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  // Serve from in-process LRU cache — pre-warmed by PUT and kept in sync.
  const cached = getCachedAdminButtonConfig(ctx.shop);
  if (cached) {
    return NextResponse.json(cached);
  }

  const config = await prisma.buyButtonConfig.findUnique({
    where: { shop: ctx.shop },
    select: BUTTON_SELECT,
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  setCachedAdminButtonConfig(ctx.shop, config as Record<string, unknown>);
  return NextResponse.json(config);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const rawBody = await req.json();

  // Extract concurrency token before schema validation — it is not a config field.
  const clientUpdatedAt = typeof rawBody?.clientUpdatedAt === "string" ? rawBody.clientUpdatedAt : null;

  const parsed = parseBody(buyButtonConfigSchema, rawBody);
  if (!parsed.success) {
    return parsed.response;
  }

  // Concurrency guard: if the client sent its last-known updatedAt and the DB
  // has a newer version, refuse the save to prevent silently overwriting changes
  // made in another session.
  if (clientUpdatedAt) {
    const current = await prisma.buyButtonConfig.findUnique({
      where: { shop: ctx.shop },
      select: { updatedAt: true },
    });
    if (current && current.updatedAt.toISOString() !== clientUpdatedAt) {
      return NextResponse.json(
        { error: "Your configuration was updated in another session. Refresh the page to get the latest version." },
        { status: 409 },
      );
    }
  }

  const data = {
    ...parsed.data,
    buttonSubtitle: parsed.data.buttonSubtitle ?? null,
  };

  const updated = await prisma.buyButtonConfig.upsert({
    where: { shop: ctx.shop },
    create: { shop: ctx.shop, ...data },
    update: data,
    select: BUTTON_SELECT,
  });

  // Pre-warm both admin and storefront caches so the next request is a cache
  // hit. setCachedAdminButtonConfig handles both caches atomically.
  setCachedAdminButtonConfig(ctx.shop, updated as Record<string, unknown>);

  void prisma.formConfigChangeLog.create({
    data: { shop: ctx.shop, configType: "buy_button" },
  }).catch(() => {});

  return NextResponse.json(updated);
});
