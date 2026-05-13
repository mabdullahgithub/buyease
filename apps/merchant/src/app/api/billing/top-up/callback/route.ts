import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ONE_TIME_CHARGE_QUERY = `
query OneTimeCharge($id: ID!) {
  node(id: $id) {
    ... on AppPurchaseOneTime {
      id
      status
      amount { amount currencyCode }
    }
  }
}`;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const host = req.nextUrl.searchParams.get("host");
  const amountStr = req.nextUrl.searchParams.get("amount");
  const chargeId = req.nextUrl.searchParams.get("charge_id");

  if (!shop || !chargeId || !amountStr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const session = await prisma.session.findFirst({
    where: { shop, isOnline: false },
    orderBy: { updatedAt: "desc" },
  });

  if (!session?.accessToken) {
    return buildRedirect(host, shop, "integrations?view=sms-whatsapp");
  }

  try {
    const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({
        query: ONE_TIME_CHARGE_QUERY,
        variables: { id: `gid://shopify/AppPurchaseOneTime/${chargeId}` },
      }),
    });

    const payload = await response.json();
    const charge = payload.data?.node;

    if (charge?.status === "ACTIVE") {
      const amount = parseFloat(charge.amount.amount);
      await prisma.merchant.update({
        where: { shop },
        data: {
          balance: { increment: amount },
        },
      });
    }
  } catch (error) {
    console.error("Top-up callback failed", error);
  }

  return buildRedirect(host, shop, "integrations?view=sms-whatsapp");
}

function buildRedirect(host: string | null, shop: string, path: string): NextResponse {
  if (host) {
    const decodedHost = Buffer.from(host, "base64").toString();
    return NextResponse.redirect(`https://${decodedHost}/apps/buyease/${path}`);
  }
  return NextResponse.redirect(`https://${shop}/admin/apps/buyease/${path}`);
}
