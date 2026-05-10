import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { buyButtonConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { invalidateButtonConfig } from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const config = await prisma.buyButtonConfig.findUnique({
    where: { shop: ctx.shop },
    select: {
      buttonText:     true,
      buttonSubtitle: true,
      iconId:         true,
      iconAlign:      true,
      showIcon:       true,
      animation:      true,
      stickyPosition: true,
      stickyMobile:   true,
      mobileFullWidth:true,
      bgColor:        true,
      textColor:      true,
      borderColor:    true,
      fontSizePx:     true,
      borderRadiusPx: true,
      borderWidthPx:  true,
      shadowStrength: true,
      widthPercent:   true,
      isBold:         true,
      isItalic:       true,
      isVisible:      true,
    },
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  return NextResponse.json(config);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(buyButtonConfigSchema, body);

  if (!parsed.success) {
    return parsed.response;
  }

  const data = {
    ...parsed.data,
    buttonSubtitle: parsed.data.buttonSubtitle ?? null,
  };

  const updated = await prisma.buyButtonConfig.upsert({
    where: { shop: ctx.shop },
    create: {
      shop: ctx.shop,
      ...data,
    },
    update: data,
    select: {
      buttonText:     true,
      buttonSubtitle: true,
      iconId:         true,
      iconAlign:      true,
      showIcon:       true,
      animation:      true,
      stickyPosition: true,
      stickyMobile:   true,
      mobileFullWidth:true,
      bgColor:        true,
      textColor:      true,
      borderColor:    true,
      fontSizePx:     true,
      borderRadiusPx: true,
      borderWidthPx:  true,
      shadowStrength: true,
      widthPercent:   true,
      isBold:         true,
      isItalic:       true,
      isVisible:      true,
    },
  });

  // Bust the in-memory storefront cache so updated button config reaches
  // shoppers within the next CDN TTL window (30s) rather than 5 minutes.
  invalidateButtonConfig(ctx.shop);

  return NextResponse.json(updated);
});
