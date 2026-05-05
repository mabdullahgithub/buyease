import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { normalizePlanKey } from "@/lib/billing";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const merchant = await prisma.merchant.findUnique({
    where: { shop: ctx.shop },
    select: {
      planBillingId: true,
      plan: { select: { name: true, interval: true } },
    },
  });

  const currentPlanRaw = merchant?.plan?.name ?? "free";
  const currentPlan = normalizePlanKey(currentPlanRaw);
  const hasActiveSubscription = !!merchant?.planBillingId || currentPlan !== "free";
  const interval = merchant?.plan?.interval ?? "MONTHLY";

  return NextResponse.json(
    { plan: currentPlan, hasActiveSubscription, interval },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
