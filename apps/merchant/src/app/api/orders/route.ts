import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withGuards } from "@/lib/middleware-stack";
import { ordersLimiter } from "@/lib/rate-limit";
import { parseBody, phoneE164, email, shopifyGid, countryCode } from "@/lib/validation";

const lineItemSchema = z.object({
  variantId: shopifyGid,
  quantity: z.number().int().min(1).max(100),
});

const shippingAddressSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  address1: z.string().trim().min(1).max(500),
  address2: z.string().trim().max(500).optional(),
  city: z.string().trim().min(1).max(100),
  province: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: countryCode,
  phone: phoneE164.optional(),
});

const createOrderSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1).max(50),
  shippingAddress: shippingAddressSchema,
  customerName: z.string().trim().min(1).max(200),
  customerPhone: phoneE164,
  customerEmail: email.optional(),
  shippingRateId: z.string().max(255).optional(),
  note: z.string().trim().max(1000).optional(),
  marketingConsent: z.boolean().default(false),
  metadata: z.record(z.string().max(50), z.string().max(500)).optional(),
});

export const POST = withGuards({ checkOrderLimit: true, rateLimiter: ordersLimiter }, async (req: NextRequest) => {
  const body = await req.json();
  const parsed = parseBody(createOrderSchema, body);
  if (!parsed.success) return parsed.response;

  const _data = parsed.data;

  // TODO: Create Shopify draft order, store in DB, increment counter
  return NextResponse.json(
    { message: "Order creation not yet implemented" },
    { status: 501 },
  );
});
