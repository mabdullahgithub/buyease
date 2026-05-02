import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPlanRecord, isShopifySubscriptionGraphqlActive } from "@/lib/billing";
import { withSessionVerification } from "@/lib/verify-session";

const ACTIVE_SUBSCRIPTIONS_QUERY = `
query ActiveSubscriptions {
  currentAppInstallation {
    activeSubscriptions {
      id
      name
      status
    }
  }
}`;

const APP_SUBSCRIPTION_CANCEL = `
mutation AppSubscriptionCancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    appSubscription { id status }
    userErrors { field message }
  }
}`;

export const POST = withSessionVerification(async (_req: NextRequest, session) => {
  const accessToken = session.accessToken ?? "";
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token", reauth: true }, { status: 401 });
  }

  const subsResponse = await fetch(`https://${session.shop}/admin/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: ACTIVE_SUBSCRIPTIONS_QUERY }),
  });

  if (!subsResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 502 });
  }

  const subsPayload = (await subsResponse.json()) as {
    data?: {
      currentAppInstallation?: {
        activeSubscriptions?: Array<{ id: string; name: string; status: string }>;
      };
    };
  };

  const activeSubs =
    subsPayload.data?.currentAppInstallation?.activeSubscriptions?.filter((s) =>
      isShopifySubscriptionGraphqlActive(s.status),
    ) ?? [];

  if (activeSubs.length === 0) {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  }

  const errors: string[] = [];
  for (const sub of activeSubs) {
    const cancelRes = await fetch(`https://${session.shop}/admin/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: APP_SUBSCRIPTION_CANCEL,
        variables: { id: sub.id },
      }),
    });

    if (!cancelRes.ok) {
      errors.push(`Failed to cancel subscription ${sub.id}`);
      continue;
    }

    const cancelPayload = (await cancelRes.json()) as {
      data?: {
        appSubscriptionCancel?: {
          userErrors?: Array<{ message: string }>;
        };
      };
    };

    const userErrors = cancelPayload.data?.appSubscriptionCancel?.userErrors ?? [];
    if (userErrors.length > 0) {
      errors.push(userErrors[0]!.message);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const freePlan = getPlanRecord("free");
  const dbPlan = await prisma.plan.upsert({
    where: { name: freePlan.name },
    create: {
      name: freePlan.name,
      price: freePlan.price,
      interval: "MONTHLY",
      features: freePlan.features,
      limits: freePlan.limits,
      isActive: true,
    },
    update: {
      price: freePlan.price,
      features: freePlan.features,
      limits: freePlan.limits,
      isActive: true,
    },
  });

  await prisma.merchant.updateMany({
    where: { shop: session.shop },
    data: {
      planId: dbPlan.id,
      planBillingId: null,
    },
  });

  return NextResponse.json({ plan: "free" });
});
