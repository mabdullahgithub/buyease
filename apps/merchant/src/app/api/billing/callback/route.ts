import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  getPlanRecord,
  isShopifySubscriptionGraphqlActive,
  resolvePlanKeyFromBillingSources,
} from "@/lib/billing";
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

const SUBSCRIPTION_LOOKUP_ATTEMPTS = 4;
const SUBSCRIPTION_LOOKUP_BASE_DELAY_MS = 350;

/** Brief retry: active subscription edges can lag the approval redirect by a second or two */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const host = req.nextUrl.searchParams.get("host");
  const approvedPlanParam = req.nextUrl.searchParams.get("plan");

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
    return verifyAndActivate(offlineSession.accessToken, shop, host, approvedPlanParam);
  }

  return verifyAndActivate(session.accessToken, shop, host, approvedPlanParam);
}

async function verifyAndActivate(
  accessToken: string,
  shop: string,
  host: string | null,
  approvedPlanParam: string | null,
): Promise<NextResponse> {
  let activeSub: {
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
  } | undefined;

  for (let attempt = 0; attempt < SUBSCRIPTION_LOOKUP_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(SUBSCRIPTION_LOOKUP_BASE_DELAY_MS * attempt);
    }

    const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: ACTIVE_SUBSCRIPTIONS_QUERY }),
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as {
      errors?: Array<{ message?: string }>;
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

    const gqlErrors = payload.errors;
    if (gqlErrors && gqlErrors.length > 0) {
      console.error("billing/callback GraphQL errors", {
        shop,
        messages: gqlErrors.map((e) => e.message),
      });
    }

    const subscriptions = payload.data?.currentAppInstallation?.activeSubscriptions ?? [];
    activeSub = subscriptions.find((s) => isShopifySubscriptionGraphqlActive(s.status));
    if (activeSub) {
      break;
    }
  }

  if (!activeSub) {
    await prisma.merchant.upsert({
      where: { shop },
      create: { shop, isActive: true },
      update: { isActive: true, uninstalledAt: null },
    });
    return buildRedirect(host, shop, "billing");
  }

  const normalizedPlan = resolvePlanKeyFromBillingSources(activeSub.name, approvedPlanParam);
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
