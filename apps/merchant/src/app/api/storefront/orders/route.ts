import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Session, DataType } from "@shopify/shopify-api";

import { prisma } from "@/lib/db";
import shopify from "@/lib/shopify";
import { parseBody } from "@/lib/validation";
import { checkAndIncrementOrderCount } from "@/lib/order-counter";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const storefrontOrderSchema = z.object({
  shop: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/),
  variantId: z.union([z.string().min(1), z.number().int().positive()]),
  quantity: z.number().int().min(1).max(10).default(1),
  shippingRateId: z.string().max(255).optional(),
  customerName: z.string().trim().min(1).max(200),
  customerPhone: z.string().trim().min(1).max(50),
  customerEmail: z.string().trim().email().max(320).optional(),
  address1: z.string().trim().min(1).max(500),
  address2: z.string().trim().max(500).optional(),
  city: z.string().trim().min(1).max(100),
  province: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().length(2).toUpperCase(),
  note: z.string().trim().max(1000).optional(),
  marketingConsent: z.boolean().default(false),
});

type ShopifyDraftOrderBody = {
  draft_order: {
    line_items: Array<{ variant_id: number; quantity: number }>;
    shipping_address: {
      first_name: string;
      last_name: string;
      address1: string;
      address2?: string;
      city: string;
      province?: string;
      zip?: string;
      country: string;
      phone: string;
    };
    shipping_line?: {
      custom: boolean;
      title: string;
      price: string;
    };
    note?: string;
    tags: string;
    email?: string;
  };
};

type ShopifyDraftOrderResponse = {
  draft_order: {
    id: number;
    name: string;
    total_price: string;
    currency: string;
    order_id: number | null;
  };
};

type ShopifyCompletedOrderResponse = {
  draft_order: {
    order_id: number;
    name?: string;
  };
};

type ShopifyOrderResponse = {
  order: {
    id: number;
    name: string;
    total_price: string;
    currency: string;
  };
};

/**
 * Pulls a human-readable error message out of a Shopify REST client error.
 * Shopify wraps validation errors as either a string, an array of strings,
 * or an object keyed by field. Walk the structure and return the first
 * meaningful string we find — keeps the storefront message actionable.
 */
function extractShopifyErrorMessage(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const e = err as Record<string, unknown>;

  // shopify-api-js HttpResponseError shape: { response: { body: { errors: ... } } }
  const body =
    (e.response as { body?: unknown } | undefined)?.body ??
    (e as { body?: unknown }).body;
  if (!body || typeof body !== "object") {
    return typeof e.message === "string" ? e.message : null;
  }
  const errors = (body as { errors?: unknown }).errors;
  if (!errors) {
    return typeof e.message === "string" ? e.message : null;
  }
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    return errors.length > 0 && typeof errors[0] === "string" ? errors[0] : null;
  }
  if (typeof errors === "object") {
    for (const [field, value] of Object.entries(errors)) {
      const first = Array.isArray(value) ? value[0] : value;
      if (typeof first === "string" && first.length > 0) {
        return field === "base" ? first : `${field} ${first}`;
      }
    }
  }
  return null;
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS });
  }

  const parsed = parseBody(storefrontOrderSchema, body);
  if (!parsed.success) return new NextResponse(parsed.response.body, { status: parsed.response.status, headers: CORS });

  const data = parsed.data;

  const merchant = await prisma.merchant.findUnique({
    where: { shop: data.shop },
    select: {
      accessToken: true,
      isActive: true,
      billingCycleStart: true,
      plan: { select: { name: true, limits: true } },
    },
  });

  if (!merchant || !merchant.isActive || !merchant.accessToken) {
    return NextResponse.json({ error: "Store not found" }, { status: 404, headers: CORS });
  }

  const planName = merchant.plan?.name ?? "free";
  const orderCheck = await checkAndIncrementOrderCount(
    data.shop,
    planName,
    merchant.billingCycleStart,
  );

  if (!orderCheck.allowed) {
    return NextResponse.json(
      { error: "This store has reached its order limit for the current billing period." },
      { status: 429, headers: CORS },
    );
  }

  let shippingLine: { custom: boolean; title: string; price: string } | undefined;
  if (data.shippingRateId) {
    const rate = await prisma.shippingRate.findFirst({
      where: { id: data.shippingRateId, shop: data.shop, isActive: true },
      select: { name: true, price: true },
    });
    if (rate) {
      shippingLine = {
        custom: true,
        title: rate.name,
        price: Number(rate.price).toFixed(2),
      };
    }
  }

  const nameParts = data.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? data.customerName;
  const lastName = nameParts.slice(1).join(" ") || "";

  const numericVariantId =
    typeof data.variantId === "number"
      ? data.variantId
      : parseInt(
          data.variantId.startsWith("gid://")
            ? data.variantId.split("/").pop() ?? data.variantId
            : data.variantId,
          10,
        );

  const draftPayload: ShopifyDraftOrderBody = {
    draft_order: {
      line_items: [{ variant_id: numericVariantId, quantity: data.quantity }],
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address1: data.address1,
        ...(data.address2 ? { address2: data.address2 } : {}),
        city: data.city,
        ...(data.province ? { province: data.province } : {}),
        ...(data.postalCode ? { zip: data.postalCode } : {}),
        country: data.country,
        phone: data.customerPhone,
      },
      ...(shippingLine ? { shipping_line: shippingLine } : {}),
      ...(data.note ? { note: data.note } : {}),
      ...(data.customerEmail ? { email: data.customerEmail } : {}),
      tags: "cod,buyease",
    },
  };

  const session = new Session({
    id: `offline_${data.shop}`,
    shop: data.shop,
    state: "",
    isOnline: false,
    accessToken: merchant.accessToken,
  });

  const client = new shopify.clients.Rest({ session });

  let draftOrderId: number;
  let draftOrderName: string;
  let totalPrice: string;
  let currency: string;

  try {
    const draftRes = await client.post<ShopifyDraftOrderResponse>({
      path: "draft_orders",
      data: draftPayload as unknown as Record<string, unknown>,
      type: DataType.JSON,
    });

    const draft = draftRes.body.draft_order;
    draftOrderId = draft.id;
    draftOrderName = draft.name;
    totalPrice = draft.total_price;
    currency = draft.currency;
  } catch (err) {
    // Shopify SDK errors typically expose `response.body` with `errors`.
    // Surface the first error to the storefront so the user gets actionable
    // feedback (e.g. "variant not found", "address invalid") instead of a
    // generic message they can't act on.
    const shopifyMessage = extractShopifyErrorMessage(err);
    console.error("Shopify draft order creation failed", {
      shop: data.shop,
      message: shopifyMessage,
      err,
    });
    return NextResponse.json(
      {
        error: shopifyMessage
          ? `Could not place order: ${shopifyMessage}`
          : "Could not place order. Please try again.",
      },
      { status: 502, headers: CORS },
    );
  }

  let finalOrderId: number | null = null;
  let finalOrderName: string = draftOrderName;

  try {
    const completeRes = await client.put<ShopifyCompletedOrderResponse>({
      path: `draft_orders/${draftOrderId}/complete`,
      query: { payment_pending: "true" },
      data: {} as Record<string, unknown>,
      type: DataType.JSON,
    });

    const completedDraft = completeRes.body.draft_order;
    finalOrderId = completedDraft.order_id ?? null;

    if (finalOrderId) {
      const orderRes = await client.get<ShopifyOrderResponse>({
        path: `orders/${finalOrderId}`,
      });
      finalOrderName = orderRes.body.order.name;
      totalPrice = orderRes.body.order.total_price;
      currency = orderRes.body.order.currency;
    }
  } catch (err) {
    console.error("Draft order completion failed — leaving as draft", {
      shop: data.shop,
      draftOrderId,
      err,
    });
    // Order still created as draft — not a hard failure
  }

  const shopifyOrderIdStr = finalOrderId
    ? String(finalOrderId)
    : `draft_${draftOrderId}`;

  try {
    await prisma.order.upsert({
      where: { shopId_orderId: { shopId: data.shop, orderId: shopifyOrderIdStr } },
      create: {
        shopId: data.shop,
        orderId: shopifyOrderIdStr,
        codAmount: parseFloat(totalPrice),
        status: "PENDING",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail ?? null,
        metadata: {
          shippingRateId: data.shippingRateId ?? null,
          marketingConsent: data.marketingConsent,
          address1: data.address1,
          city: data.city,
          country: data.country,
        },
      },
      update: {},
    });
  } catch (err) {
    console.error("Order DB save failed", { shop: data.shop, shopifyOrderIdStr, err });
  }

  return NextResponse.json(
    {
      orderId: shopifyOrderIdStr,
      orderName: finalOrderName,
      total: totalPrice,
      currency,
    },
    { status: 201, headers: CORS },
  );
}
