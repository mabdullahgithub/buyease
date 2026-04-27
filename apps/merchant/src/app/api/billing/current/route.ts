import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { withSessionVerification } from "@/lib/verify-session";

export const GET = withSessionVerification(async (_req: NextRequest, session) => {
  const merchant = await prisma.merchant.findUnique({
    where: { shop: session.shop },
    select: {
      planBillingId: true,
      plan: { select: { name: true, interval: true } },
    },
  });

  const currentPlan = merchant?.plan?.name?.toLowerCase() ?? "free";
  const hasActiveSubscription = !!merchant?.planBillingId;
  const interval = merchant?.plan?.interval ?? "MONTHLY";

  return NextResponse.json(
    { plan: currentPlan, hasActiveSubscription, interval },
    { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } },
  );
});
