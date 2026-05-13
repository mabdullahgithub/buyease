import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { withGuards } from "@/lib/middleware-stack";

const bodySchema = z.object({
  amount: z.string().or(z.number()),
  host: z.string().optional(),
});

const APP_PURCHASE_ONE_TIME_CREATE = `
mutation AppPurchaseOneTime($name: String!, $price: MoneyInput!, $returnUrl: URL!, $test: Boolean) {
  appPurchaseOneTimeCreate(name: $name, price: $price, returnUrl: $returnUrl, test: $test) {
    appPurchaseOneTime { id }
    confirmationUrl
    userErrors { field message }
  }
}`;

export const POST = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amount = parseFloat(String(parsed.data.amount));
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const hostParam = parsed.data.host ?? "";
    const testMode = process.env.SHOPIFY_BILLING_TEST === "true";
    const accessToken = ctx.session.accessToken ?? "";

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized", reauth: true }, { status: 401 });
    }

    const callbackParams = new URLSearchParams({
      shop: ctx.shop,
      amount: amount.toString(),
      ...(hostParam ? { host: hostParam } : {}),
    });

    const response = await fetch(`https://${ctx.shop}/admin/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: APP_PURCHASE_ONE_TIME_CREATE,
        variables: {
          name: "SMS Messages",
          price: { amount: amount, currencyCode: "USD" },
          returnUrl: `${merchantAppOrigin()}/api/billing/top-up/callback?${callbackParams.toString()}`,
          test: testMode,
        },
      }),
    });

    const payload = await response.json();
    const result = payload.data?.appPurchaseOneTimeCreate;

    if (!result?.confirmationUrl) {
      return NextResponse.json(
        { error: result?.userErrors?.[0]?.message ?? "Top-up creation failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      confirmationUrl: result.confirmationUrl,
    });
  } catch (error) {
    console.error("Top-up route failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
