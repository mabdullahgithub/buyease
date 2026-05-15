import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formDesignConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { invalidateFormConfig } from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

const SELECT = {
  formType:          true,
  fields:            true,
  formBgColor:       true,
  formTextColor:     true,
  formBorderColor:   true,
  formBorderRadiusPx:true,
  formBorderWidthPx: true,
  formShadowPx:      true,
  formPaddingPx:     true,
  formTextBold:      true,
  formTextItalic:    true,
  fieldBgColor:      true,
  fieldTextColor:    true,
  fieldBorderColor:  true,
  fieldBorderRadiusPx:true,
  fieldFontSizePx:   true,
  textAlign:         true,
  hideLabels:        true,
  showIcons:         true,
  rtl:               true,
  autocomplete:      true,
  stickyMobile:      true,
  errorRequired:     true,
  errorInvalid:      true,
  errorSoldOut:      true,
  isVisible:         true,
  countriesEnabled:  true,
  countries:         true,
} as const;

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const config = await prisma.formDesignConfig.findUnique({
    where: { shop: ctx.shop },
    select: SELECT,
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  return NextResponse.json(config);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(formDesignConfigSchema, body);

  if (!parsed.success) {
    return parsed.response;
  }

  const updated = await prisma.formDesignConfig.upsert({
    where: { shop: ctx.shop },
    create: { shop: ctx.shop, ...parsed.data },
    update: parsed.data,
    select: SELECT,
  });

  // Bust the in-memory storefront cache so the next shopper sees the updated config
  // within the next CDN TTL window (30s) rather than waiting 5 minutes.
  invalidateFormConfig(ctx.shop);

  return NextResponse.json(updated);
});
