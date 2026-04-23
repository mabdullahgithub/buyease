import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPlanRecord, normalizePlanKey } from "@/lib/billing";
import { merchantAppOrigin } from "@/lib/merchant-app-url";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const planParam = req.nextUrl.searchParams.get("plan");

  if (!shop || !planParam) {
    return NextResponse.json({ error: "Missing billing callback params" }, { status: 400 });
  }

  const normalizedPlan = normalizePlanKey(planParam);
  const planRecord = getPlanRecord(normalizedPlan);

  const dbPlan = await prisma.plan.upsert({
    where: { name: planRecord.name },
    create: {
      name: planRecord.name,
      price: planRecord.price,
      interval: "MONTHLY",
      features: planRecord.features,
      limits: planRecord.limits,
      isActive: true,
    },
    update: {
      price: planRecord.price,
      features: planRecord.features,
      limits: planRecord.limits,
      isActive: true,
    },
  });

  await prisma.merchant.upsert({
    where: { shop },
    create: {
      shop,
      isActive: true,
      planId: dbPlan.id,
    },
    update: {
      isActive: true,
      uninstalledAt: null,
      planId: dbPlan.id,
      billingCycleStart: new Date(),
    },
  });

  return NextResponse.redirect(`${merchantAppOrigin()}/billing?shop=${encodeURIComponent(shop)}`);
}
