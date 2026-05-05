import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { shippingRatesSyncSchema } from "@/lib/form-config-schemas";
import { withGuards } from "@/lib/middleware-stack";
import { parseBody } from "@/lib/validation";

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const rates = await prisma.shippingRate.findMany({
    where: { shop: ctx.shop },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      conditions: true,
      countriesEnabled: true,
      countries: true,
      provincesEnabled: true,
      provinces: true,
      importedFromShopify: true,
      isActive: true,
      sortOrder: true,
    },
  });

  const serialized = rates.map((r) => ({
    ...r,
    price: Number(r.price),
  }));

  return NextResponse.json(serialized);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const body = await req.json();
  const parsed = parseBody(shippingRatesSyncSchema, body);

  if (!parsed.success) {
    return parsed.response;
  }

  const incoming = parsed.data.rates;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.shippingRate.findMany({
      where: { shop: ctx.shop },
      select: { id: true },
    });

    const existingIds = existing.map((r) => r.id);
    const incomingIds = incoming
      .map((r) => r.id)
      .filter((id): id is string => Boolean(id));

    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
      await tx.shippingRate.deleteMany({
        where: { id: { in: idsToDelete }, shop: ctx.shop },
      });
    }

    for (let i = 0; i < incoming.length; i++) {
      const rate = incoming[i];
      const data = {
        name: rate.name,
        description: rate.description ?? null,
        price: rate.price,
        currency: rate.currency,
        conditions: rate.conditions,
        countriesEnabled: rate.countriesEnabled,
        countries: rate.countries,
        provincesEnabled: rate.provincesEnabled,
        provinces: rate.provinces,
        importedFromShopify: rate.importedFromShopify,
        isActive: rate.isActive,
        sortOrder: i,
      };

      if (rate.id) {
        await tx.shippingRate.update({
          where: { id: rate.id },
          data,
        });
      } else {
        await tx.shippingRate.create({
          data: { ...data, shop: ctx.shop },
        });
      }
    }
  });

  const updated = await prisma.shippingRate.findMany({
    where: { shop: ctx.shop },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      conditions: true,
      countriesEnabled: true,
      countries: true,
      provincesEnabled: true,
      provinces: true,
      importedFromShopify: true,
      isActive: true,
      sortOrder: true,
    },
  });

  const serialized = updated.map((r) => ({
    ...r,
    price: Number(r.price),
  }));

  return NextResponse.json(serialized);
});
