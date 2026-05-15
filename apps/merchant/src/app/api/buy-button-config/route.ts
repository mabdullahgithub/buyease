import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { buyButtonConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { setCachedButtonConfig } from "@/lib/storefront-config-cache";
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
  const config = await prisma.buyButtonConfig.findUnique({
    where: { shop: ctx.shop },
    select: BUTTON_SELECT,
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

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

  // Pre-warm the storefront LRU cache immediately so the next shopper request
  // hits the cache instead of the DB. Strip updatedAt — storefront responses
  // don't include it and we don't want it leaking to the public CDN response.
  const { updatedAt: _at, ...cacheData } = updated;
  setCachedButtonConfig(ctx.shop, cacheData as Record<string, unknown>);

  void prisma.formConfigChangeLog.create({
    data: { shop: ctx.shop, configType: "buy_button" },
  }).catch(() => {});

  return NextResponse.json(updated);
});
