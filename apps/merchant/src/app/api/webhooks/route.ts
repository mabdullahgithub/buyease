import { NextRequest, NextResponse } from "next/server";

import { verifyShopifyWebhookHmac } from "@buyease/utils";
import { prisma } from "@/lib/db";
import { getPlanRecord, normalizePlanKey } from "@/lib/billing";
import { sessionStorage } from "@/lib/shopify";

type AppSubscriptionPayload = {
  app_subscription?: {
    status?: string;
    name?: string;
  };
};

type AppUninstalledPayload = {
  domain?: string;
  myshopify_domain?: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.text();
    const topic = req.headers.get("x-shopify-topic") ?? "";
    const headerShop = (req.headers.get("x-shopify-shop-domain") ?? "").trim().toLowerCase();
    const hmac = req.headers.get("x-shopify-hmac-sha256") ?? "";

    if (!hmac) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.SHOPIFY_API_SECRET ?? "";
    const valid = verifyShopifyWebhookHmac(rawBody, secret, hmac);

    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: AppSubscriptionPayload & AppUninstalledPayload = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody) as AppSubscriptionPayload & AppUninstalledPayload;
      } catch {
        console.error("Webhook body is not valid JSON", { topic });
      }
    }

    switch (topic) {
      case "app/uninstalled": {
        const bodyShop =
          typeof payload.myshopify_domain === "string"
            ? payload.myshopify_domain.trim().toLowerCase()
            : typeof payload.domain === "string"
              ? payload.domain.trim().toLowerCase()
              : "";
        const shop = headerShop || bodyShop;
        if (!shop) {
          console.error("app/uninstalled: missing shop domain (header and body)");
          break;
        }
        try {
          const sessions = await sessionStorage.findSessionsByShop(shop);
          if (sessions.length > 0) {
            await sessionStorage.deleteSessions(sessions.map((s) => s.id));
          }
        } catch (error) {
          console.error("Redis session cleanup on uninstall failed", error);
        }
        await prisma.session.deleteMany({ where: { shop } });
        const merchantResult = await prisma.merchant.updateMany({
          where: { shop },
          data: {
            isActive: false,
            uninstalledAt: new Date(),
          },
        });
        if (merchantResult.count === 0) {
          console.warn("app/uninstalled: no Merchant row updated", { shop });
        }
        break;
      }
      case "app_subscriptions/update": {
        const shop = headerShop;
        if (!shop) {
          console.error("app_subscriptions/update: missing x-shopify-shop-domain");
          break;
        }
        const status = payload.app_subscription?.status;
        if (status === "ACTIVE") {
          const normalizedPlan = normalizePlanKey(payload.app_subscription?.name ?? "free");
          const planRecord = getPlanRecord(normalizedPlan);

          const dbPlan = await prisma.plan.upsert({
            where: { name: planRecord.name },
            create: {
              name: planRecord.name,
              price: planRecord.price,
              interval: "MONTHLY",
              features: planRecord.features,
              limits: planRecord.limits,
              isActive: true,
            },
            update: {
              price: planRecord.price,
              features: planRecord.features,
              limits: planRecord.limits,
              isActive: true,
            },
          });

          await prisma.merchant.upsert({
            where: { shop },
            create: {
              shop,
              isActive: true,
              planId: dbPlan.id,
              billingCycleStart: new Date(),
            },
            update: {
              isActive: true,
              uninstalledAt: null,
              planId: dbPlan.id,
              billingCycleStart: new Date(),
            },
          });
        } else if (status === "CANCELLED" || status === "DECLINED") {
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
            where: { shop },
            data: { planId: dbPlan.id },
          });
        }
        break;
      }
      case "orders/create":
      case "orders/updated":
      case "customers/data_request":
      case "customers/redact":
      case "shop/redact":
        break;
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
