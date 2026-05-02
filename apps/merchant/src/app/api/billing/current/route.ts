import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { normalizePlanKey } from "@/lib/billing";
import { withSessionVerification } from "@/lib/verify-session";

export const GET = withSessionVerification(async (_req: NextRequest, session) => {
  const merchant = await prisma.merchant.findUnique({
    where: { shop: session.shop },
    select: {
      planBillingId: true,
      plan: { select: { name: true, interval: true } },
    },
  });

  const currentPlanRaw = merchant?.plan?.name ?? "free";
  const currentPlan = normalizePlanKey(currentPlanRaw);
  /** Paid Shopify tier and/or lingering subscription id — drives cancel/downgrade UX */
  const hasActiveSubscription = !!merchant?.planBillingId || currentPlan !== "free";
  const interval = merchant?.plan?.interval ?? "MONTHLY";

  return NextResponse.json(
    { plan: currentPlan, hasActiveSubscription, interval },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
