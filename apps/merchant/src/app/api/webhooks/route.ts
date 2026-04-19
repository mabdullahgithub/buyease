import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyWebhookHmac } from "@buyease/utils";
import { db } from "@buyease/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256") ?? "";
    const topic = request.headers.get("x-shopify-topic") ?? "";
    const shop = request.headers.get("x-shopify-shop-domain") ?? "";

    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const isValid = verifyShopifyWebhookHmac(rawBody, secret, hmacHeader);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    setImmediate(() => void handleWebhook(topic, shop, rawBody));

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[webhooks] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleWebhook(topic: string, shop: string, rawBody: string): Promise<void> {
  try {
    switch (topic) {
      case "app/uninstalled":
        await db.merchant.updateMany({
          where: { shop },
          data: { isActive: false, uninstalledAt: new Date() },
        });
        break;

      case "orders/create": {
        const order = JSON.parse(rawBody) as { id: number; total_price: string };
        await db.order.create({
          data: {
            shopId: shop,
            orderId: String(order.id),
            codAmount: parseFloat(order.total_price),
            status: "PENDING",
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[webhooks] Failed to process topic "${topic}" for shop "${shop}":`, error);
  }
}
