import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PLANS, getBillingPrice, type PlanKey, type BillingInterval } from "@/lib/billing";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { withGuards } from "@/lib/middleware-stack";
import { validationErrorResponse } from "@/lib/validation";

const bodySchema = z.object({
  plan: z.enum(["premium", "enterprise", "unlimited"]),
  interval: z.enum(["EVERY_30_DAYS", "ANNUAL"]).default("EVERY_30_DAYS"),
  host: z.string().optional(),
});

const APP_SUBSCRIPTION_CREATE = `
mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean) {
  appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test) {
    appSubscription { id status }
    confirmationUrl
    userErrors { field message }
  }
}`;

export const POST = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const plan = parsed.data.plan as PlanKey;
    const interval = parsed.data.interval as BillingInterval;
    const hostParam = parsed.data.host ?? "";
    const selectedPlan = PLANS[plan];
    const testMode = process.env.SHOPIFY_BILLING_TEST === "true";
    const accessToken = ctx.session.accessToken ?? "";

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token", reauth: true }, { status: 401 });
    }

    const price = getBillingPrice(selectedPlan, interval);
    const billingInterval = interval === "ANNUAL" ? "ANNUAL" : "EVERY_30_DAYS";

    const callbackParams = new URLSearchParams({
      shop: ctx.shop,
      plan,
      ...(hostParam ? { host: hostParam } : {}),
    });

    const response = await fetch(`https://${ctx.shop}/admin/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: APP_SUBSCRIPTION_CREATE,
        variables: {
          name: selectedPlan.name,
          returnUrl: `${merchantAppOrigin()}/api/billing/callback?${callbackParams.toString()}`,
          test: testMode,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: price,
                    currencyCode: selectedPlan.currencyCode,
                  },
                  interval: billingInterval,
                },
              },
            },
          ],
        },
      }),
    });

    const payload = (await response.json()) as {
      data?: {
        appSubscriptionCreate?: {
          confirmationUrl?: string;
          userErrors?: Array<{ message: string }>;
        };
      };
    };
    const result = payload.data?.appSubscriptionCreate;
    if (!result?.confirmationUrl) {
      return NextResponse.json(
        { error: result?.userErrors?.[0]?.message ?? "Billing creation failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      confirmationUrl: result.confirmationUrl,
      testMode,
    });
  } catch (error) {
    console.error("Billing route failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
