import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formSettingsConfigSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { invalidateFormConfig } from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

const SELECT = {
  formPlacement:          true,
  hideCheckout:           true,
  hideAddToCart:          true,
  hideBuyNow:             true,
  whenOpened:             true,
  disableInPages:         true,
  productRestrictionMode: true,
  restrictedProducts:     true,
  restrictedCollections:  true,
  allowCountriesOnly:     true,
  allowedCountries:       true,
  enableOrderEligibility: true,
  orderEligibilityMin:    true,
  orderEligibilityMax:    true,
  showIneligibleMessage:  true,
  ineligibleMessage:      true,
  hideSubmitButton:       true,
  disableOutOfStock:      true,
  disableAllDiscounts:    true,
  disableShopifyDiscount: true,
  customCss:              true,
  updatedAt:              true,
} as const;

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const config = await prisma.formDesignConfig.findUnique({
    where: { shop: ctx.shop },
    select: SELECT,
  });

  const defaults = formSettingsConfigSchema.parse({});
  return NextResponse.json(config ?? defaults);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const rawBody = await req.json();

  // Extract concurrency token before schema validation — it is not a config field.
  const clientUpdatedAt =
    typeof rawBody?.clientUpdatedAt === "string" ? rawBody.clientUpdatedAt : null;

  const parsed = parseBody(formSettingsConfigSchema, rawBody);
  if (!parsed.success) {
    return parsed.response;
  }

  // Concurrency guard: refuse the save if a newer version exists in DB.
  if (clientUpdatedAt) {
    const current = await prisma.formDesignConfig.findUnique({
      where: { shop: ctx.shop },
      select: { updatedAt: true },
    });
    if (current && current.updatedAt.toISOString() !== clientUpdatedAt) {
      return NextResponse.json(
        {
          error:
            "Your configuration was updated in another session. Refresh the page to get the latest version.",
        },
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

  invalidateFormConfig(ctx.shop);

  void prisma.formConfigChangeLog
    .create({ data: { shop: ctx.shop, configType: "form_settings" } })
    .catch(() => {});

  return NextResponse.json(updated);
});
