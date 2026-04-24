import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { withSessionVerification } from "@/lib/verify-session";

export const GET = withSessionVerification(async (_req: NextRequest, session) => {
  const merchant = await prisma.merchant.findUnique({
    where: { shop: session.shop },
    select: {
      plan: { select: { name: true } },
    },
  });

  const currentPlan = merchant?.plan?.name?.toLowerCase() ?? "free";

  return NextResponse.json({ plan: currentPlan });
});
