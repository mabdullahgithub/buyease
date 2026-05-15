import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formDesignConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { invalidateFormConfig } from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

const SELECT = {
  formType:            true,
  fields:              true,
  formBgColor:         true,
  formTextColor:       true,
  formBorderColor:     true,
  formBorderRadiusPx:  true,
  formBorderWidthPx:   true,
  formShadowPx:        true,
  formPaddingPx:       true,
  formTextBold:        true,
  formTextItalic:      true,
  fieldBgColor:        true,
  fieldTextColor:      true,
  fieldBorderColor:    true,
  fieldBorderRadiusPx: true,
  fieldFontSizePx:     true,
  textAlign:           true,
  hideLabels:          true,
  showIcons:           true,
  rtl:                 true,
  autocomplete:        true,
  stickyMobile:        true,
  errorRequired:       true,
  errorInvalid:        true,
  errorSoldOut:        true,
  isVisible:           true,
  countriesEnabled:    true,
  countries:           true,
  updatedAt:           true,
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
  const rawBody = await req.json();

  // Extract concurrency token before schema validation — it is not a config field.
  const clientUpdatedAt = typeof rawBody?.clientUpdatedAt === "string" ? rawBody.clientUpdatedAt : null;

  const parsed = parseBody(formDesignConfigSchema, rawBody);
  if (!parsed.success) {
    return parsed.response;
  }

  // Concurrency guard: if the client sent its last-known updatedAt and the DB
  // has a newer version, refuse the save to prevent silently overwriting changes
  // made in another session.
  if (clientUpdatedAt) {
    const current = await prisma.formDesignConfig.findUnique({
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

  const updated = await prisma.formDesignConfig.upsert({
    where: { shop: ctx.shop },
    create: { shop: ctx.shop, ...parsed.data },
    update: parsed.data,
    select: SELECT,
  });

  // Invalidate the storefront LRU cache so the next request fetches a full,
  // merged config from DB (pre-warming with a partial SELECT would strip the
  // restriction/settings fields saved by the form-settings route).
  invalidateFormConfig(ctx.shop);

  void prisma.formConfigChangeLog.create({
    data: { shop: ctx.shop, configType: "form_design" },
  }).catch(() => {});

  return NextResponse.json(updated);
});
