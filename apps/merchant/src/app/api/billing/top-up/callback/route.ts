import { NextRequest, NextResponse } from "next/server";

import {
  creditMerchantBalanceForActivatedOneTimePurchase,
  normalizeShopForMerchantDb,
  resolveOfflineMerchantAccessToken,
  resolvePendingTopUpPurchaseGid,
} from "@/lib/messaging-top-up-credit";
import shopify from "@/lib/shopify";

const SMS_VIEW_PATH = "integrations?view=sms-whatsapp&billing_sync=1";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rawShop = req.nextUrl.searchParams.get("shop");
  const shop =
    shopify.utils.sanitizeShop(rawShop ?? "", true) ?? rawShop?.trim().toLowerCase() ?? null;
  const host = req.nextUrl.searchParams.get("host");
  const chargeFromQuery =
    req.nextUrl.searchParams.get("charge_id")?.trim() ||
    req.nextUrl.searchParams.get("id")?.trim() ||
    null;

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const chargeId =
    chargeFromQuery && chargeFromQuery.length > 0
      ? chargeFromQuery
      : await resolvePendingTopUpPurchaseGid(shop);

  if (!chargeId) {
    return NextResponse.json({ error: "Missing charge reference" }, { status: 400 });
  }

  const accessToken = await resolveOfflineMerchantAccessToken(normalizeShopForMerchantDb(shop));
  if (!accessToken) {
    console.error(`Top-up callback: no offline access token found for shop ${shop}`);
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
