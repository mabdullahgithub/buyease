import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { withGuards } from "@/lib/middleware-stack";
import { invalidateFormConfig } from "@/lib/storefront-config-cache";
import { parseBody } from "@/lib/validation";

const SELECT = {
  googleAutocomplete: true,
  googleAcCountries: true,
  googleAcLanguage: true,
  googleAcPlaceType: true,
  googleAcFillCity: true,
  googleAcFillPostalCode: true,
  googleAcFillProvince: true,
  googleAcFillCountry: true,
  googleAcMapPicker: true,
  googleAcAutoLocate: true,
} as const;

const googleAcSettingsSchema = z.object({
  googleAutocomplete: z.boolean(),
  googleAcCountries: z.array(z.string().length(2)).max(5).default([]),
  googleAcLanguage: z.string().max(10).nullable().default(null),
  googleAcPlaceType: z.enum(["address", "geocode"]).default("address"),
  googleAcFillCity: z.boolean().default(true),
  googleAcFillPostalCode: z.boolean().default(true),
  googleAcFillProvince: z.boolean().default(true),
  googleAcFillCountry: z.boolean().default(true),
  googleAcMapPicker: z.boolean().default(false),
  googleAcAutoLocate: z.boolean().default(false),
});

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const [config, merchant] = await Promise.all([
    prisma.formDesignConfig.findUnique({
      where: { shop: ctx.shop },
      select: SELECT,
    }),
    prisma.merchant.findUnique({
      where: { shop: ctx.shop },
      select: { balance: true },
    }),
  ]);

  return NextResponse.json({
    googleAutocomplete: config?.googleAutocomplete ?? false,
    googleAcCountries: config?.googleAcCountries ?? [],
    googleAcLanguage: config?.googleAcLanguage ?? null,
    googleAcPlaceType: config?.googleAcPlaceType ?? "address",
    googleAcFillCity: config?.googleAcFillCity ?? true,
    googleAcFillPostalCode: config?.googleAcFillPostalCode ?? true,
    googleAcFillProvince: config?.googleAcFillProvince ?? true,
    googleAcFillCountry: config?.googleAcFillCountry ?? true,
    googleAcMapPicker: config?.googleAcMapPicker ?? false,
    googleAcAutoLocate: config?.googleAcAutoLocate ?? false,
    balance: Number(merchant?.balance ?? 0),
  });
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(googleAcSettingsSchema, body);
  if (!parsed.success) {
    return parsed.response;
  }

  const updated = await prisma.formDesignConfig.upsert({
    where: { shop: ctx.shop },
    create: { shop: ctx.shop, ...parsed.data },
    update: parsed.data,
    select: SELECT,
  });

  invalidateFormConfig(ctx.shop);

  const merchant = await prisma.merchant.findUnique({
    where: { shop: ctx.shop },
    select: { balance: true },
  });

  return NextResponse.json({
    ...updated,
    balance: Number(merchant?.balance ?? 0),
  });
});
