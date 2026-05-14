import { NextRequest, NextResponse } from "next/server";

import {
  creditMerchantBalanceForActivatedOneTimePurchase,
  resolveOfflineMerchantAccessToken,
} from "@/lib/messaging-top-up-credit";

const SMS_VIEW_PATH = "integrations?view=sms-whatsapp&billing_sync=1";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop");
  const host = req.nextUrl.searchParams.get("host");
  const chargeId = req.nextUrl.searchParams.get("charge_id") ?? req.nextUrl.searchParams.get("id");

  if (!shop || !chargeId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const accessToken = await resolveOfflineMerchantAccessToken(shop);
  if (!accessToken) {
    return buildRedirect(host, shop, SMS_VIEW_PATH);
  }

  try {
    await creditMerchantBalanceForActivatedOneTimePurchase(shop, accessToken, chargeId);
  } catch (error) {
    console.error("Top-up callback failed", error);
  }

  return buildRedirect(host, shop, SMS_VIEW_PATH);
}

function buildRedirect(host: string | null, shop: string, path: string): NextResponse {
  if (host) {
    const decodedHost = Buffer.from(host, "base64").toString();
    return NextResponse.redirect(`https://${decodedHost}/apps/buyease/${path}`);
  }
  return NextResponse.redirect(`https://${shop}/admin/apps/buyease/${path}`);
}
