import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyWebhookHmac } from "@buyease/utils";
import { db, Prisma } from "@buyease/db";
import { validateShopDomain } from "@/lib/auth";
import { invalidateMerchantAppCache } from "@/lib/merchant-cache";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256") ?? "";
    const topic = request.headers.get("x-shopify-topic") ?? "";
    const shopHeader = request.headers.get("x-shopify-shop-domain") ?? "";

    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const isValid = verifyShopifyWebhookHmac(rawBody, secret, hmacHeader);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    await handleWebhook(topic, shopHeader, rawBody);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[webhooks] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function webhookShop(shopHeader: string): string | null {
  return validateShopDomain(shopHeader);
}

async function handleWebhook(topic: string, shopHeader: string, rawBody: string): Promise<void> {
  const shop = webhookShop(shopHeader);

  try {
    switch (topic) {
      case "app/uninstalled": {
        if (!shop) {
          console.warn("[webhooks] app/uninstalled: invalid shop header", shopHeader);
          return;
        }
        await db.$transaction([
          db.session.deleteMany({ where: { shop } }),
          db.merchant.updateMany({
            where: { shop },
            data: { isActive: false, uninstalledAt: new Date() },
          }),
        ]);
        invalidateMerchantAppCache(shop);
        break;
      }

      case "shop/redact": {
        if (!shop) {
          console.warn("[webhooks] shop/redact: invalid shop header", shopHeader);
          return;
        }
        await db.$transaction([
          db.session.deleteMany({ where: { shop } }),
          db.order.deleteMany({ where: { shopId: shop } }),
          db.merchant.deleteMany({ where: { shop } }),
        ]);
        invalidateMerchantAppCache(shop);
        break;
      }

      case "customers/redact": {
        if (!shop) {
          console.warn("[webhooks] customers/redact: invalid shop header", shopHeader);
          return;
        }
        let payload: { orders_to_redact?: unknown };
        try {
          payload = JSON.parse(rawBody) as { orders_to_redact?: unknown };
        } catch {
          console.warn("[webhooks] customers/redact: invalid JSON");
          return;
        }
        const rawIds = payload.orders_to_redact;
        const orderIds = Array.isArray(rawIds)
          ? rawIds.map((id) => String(id)).filter((id) => id.length > 0)
          : [];
        if (orderIds.length === 0) {
          return;
        }
        await db.order.updateMany({
          where: { shopId: shop, orderId: { in: orderIds } },
          data: {
            customerName: null,
            customerPhone: null,
            customerEmail: null,
            metadata: Prisma.JsonNull,
          },
        });
        invalidateMerchantAppCache(shop);
        break;
      }

      case "customers/data_request": {
        if (!shop) {
          console.warn("[webhooks] customers/data_request: invalid shop header", shopHeader);
          return;
        }
        try {
          const payload = JSON.parse(rawBody) as { customer?: { id?: unknown } };
          console.info("[webhooks] customers/data_request", {
            shop,
            customerId: payload.customer?.id,
          });
        } catch {
          console.info("[webhooks] customers/data_request", { shop });
        }
        break;
      }

      case "orders/create": {
        if (!shop) {
          console.warn("[webhooks] orders/create: invalid shop header", shopHeader);
          return;
        }
        const order = JSON.parse(rawBody) as { id: number; total_price: string };
        await db.order.create({
          data: {
            shopId: shop,
            orderId: String(order.id),
            codAmount: parseFloat(order.total_price),
            status: "PENDING",
          },
        });
        invalidateMerchantAppCache(shop);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[webhooks] Failed to process topic "${topic}" for shop "${shopHeader}":`, error);
  }
}
