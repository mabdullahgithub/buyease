import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPlanRecord, normalizePlanKey } from "@/lib/billing";

/**
 * Billing callback — Shopify redirects here after the merchant approves/declines
 * the charge on the Shopify billing page.
 *
 * After processing, redirects back into the Shopify admin embedded context
 * (not the raw Vercel URL) so the app loads correctly inside the admin iframe.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const planParam = req.nextUrl.searchParams.get("plan");
  const host = req.nextUrl.searchParams.get("host");

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

  // Redirect back into the Shopify admin embedded app context.
  // If host is available (base64-encoded admin URL), decode and use it.
  // Otherwise fall back to the shop's admin URL directly.
  if (host) {
    const decodedHost = Buffer.from(host, "base64").toString();
    return NextResponse.redirect(`https://${decodedHost}/apps/buyease/billing`);
  }

  // Fallback: construct the admin URL from the shop domain
  return NextResponse.redirect(`https://${shop}/admin/apps/buyease/billing`);
}
