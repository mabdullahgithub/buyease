import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPlanRecord, normalizePlanKey } from "@/lib/billing";
import { sessionStorage } from "@/lib/shopify";

const ACTIVE_SUBSCRIPTIONS_QUERY = `
query ActiveSubscriptions {
  currentAppInstallation {
    activeSubscriptions {
      id
      name
      status
      lineItems {
        plan {
          pricingDetails {
            ... on AppRecurringPricing {
              interval
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
}`;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const host = req.nextUrl.searchParams.get("host");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const session = await prisma.session.findFirst({
    where: { shop, isOnline: false },
    select: { accessToken: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!session?.accessToken) {
    const sessions = await sessionStorage.findSessionsByShop(shop);
    const offlineSession = sessions.find((s) => !s.isOnline && s.accessToken);
    if (!offlineSession?.accessToken) {
      return buildRedirect(host, shop, "billing");
    }
    return verifyAndActivate(offlineSession.accessToken, shop, host);
  }

  return verifyAndActivate(session.accessToken, shop, host);
}

async function verifyAndActivate(
  accessToken: string,
  shop: string,
  host: string | null,
): Promise<NextResponse> {
  const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: ACTIVE_SUBSCRIPTIONS_QUERY }),
  });

  if (!response.ok) {
    return buildRedirect(host, shop, "billing");
  }

  const payload = (await response.json()) as {
    data?: {
      currentAppInstallation?: {
        activeSubscriptions?: Array<{
          id: string;
          name: string;
          status: string;
          lineItems?: Array<{
            plan?: {
              pricingDetails?: {
                interval?: string;
                price?: { amount: string; currencyCode: string };
              };
            };
          }>;
        }>;
      };
    };
  };

  const subscriptions = payload.data?.currentAppInstallation?.activeSubscriptions ?? [];
  const activeSub = subscriptions.find((s) => s.status === "ACTIVE");

  if (!activeSub) {
    await prisma.merchant.upsert({
      where: { shop },
      create: { shop, isActive: true },
      update: { isActive: true, uninstalledAt: null },
    });
    return buildRedirect(host, shop, "billing");
  }

  const normalizedPlan = normalizePlanKey(activeSub.name);
  const planRecord = getPlanRecord(normalizedPlan);
  const subInterval = activeSub.lineItems?.[0]?.plan?.pricingDetails?.interval;
  const dbInterval = subInterval === "ANNUAL" ? "ANNUAL" : "MONTHLY";

  const dbPlan = await prisma.plan.upsert({
    where: { name: planRecord.name },
    create: {
      name: planRecord.name,
      price: planRecord.price,
      interval: dbInterval,
      features: planRecord.features,
      limits: planRecord.limits,
      isActive: true,
    },
    update: {
      price: planRecord.price,
      interval: dbInterval,
      features: planRecord.features,
      limits: planRecord.limits,
      isActive: true,
    },
  });

  const gid = activeSub.id;
  const numericId = gid.replace("gid://shopify/AppSubscription/", "");

  await prisma.merchant.upsert({
    where: { shop },
    create: {
      shop,
      isActive: true,
      planId: dbPlan.id,
      planBillingId: numericId,
      billingCycleStart: new Date(),
    },
    update: {
      isActive: true,
      uninstalledAt: null,
      planId: dbPlan.id,
      planBillingId: numericId,
    },
  });

  return buildRedirect(host, shop, "billing");
}

function buildRedirect(host: string | null, shop: string, path: string): NextResponse {
  if (host) {
    const decodedHost = Buffer.from(host, "base64").toString();
    return NextResponse.redirect(`https://${decodedHost}/apps/buyease/${path}`);
  }
  return NextResponse.redirect(`https://${shop}/admin/apps/buyease/${path}`);
}
