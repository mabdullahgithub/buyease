import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type StoredCondition = {
  type:
    | "order_total_gte"
    | "order_total_lte"
    | "order_weight_gte"
    | "order_weight_lte"
    | "quantity_gte"
    | "quantity_lte"
    | "cart_contains"
    | "cart_not_contains";
  value: number | string;
};

type CartContext = {
  country: string | null;
  province: string | null;
  subtotal: number; // cart subtotal in major units (e.g. 749.95)
  quantity: number;
  weight: number; // in kg
  productHandles: Set<string>;
};

function parseCart(req: NextRequest): CartContext {
  const params = req.nextUrl.searchParams;

  const country = params.get("country")?.trim().toUpperCase() || null;
  const province = params.get("province")?.trim().toUpperCase() || null;

  const subtotal = Number.parseFloat(params.get("subtotal") || "0");
  const quantity = Number.parseInt(params.get("quantity") || "1", 10);
  const weight = Number.parseFloat(params.get("weight") || "0");

  const handlesRaw = params.get("handles") || "";
  const productHandles = new Set(
    handlesRaw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );

  return {
    country,
    province,
    subtotal: Number.isFinite(subtotal) && subtotal >= 0 ? subtotal : 0,
    quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1,
    weight: Number.isFinite(weight) && weight >= 0 ? weight : 0,
    productHandles,
  };
}

function isValidCondition(c: unknown): c is StoredCondition {
  if (!c || typeof c !== "object") return false;
  const obj = c as Record<string, unknown>;
  return (
    typeof obj.type === "string" &&
    (typeof obj.value === "number" || typeof obj.value === "string")
  );
}

function conditionPasses(cond: StoredCondition, cart: CartContext): boolean {
  switch (cond.type) {
    case "order_total_gte":
      return cart.subtotal >= Number(cond.value);
    case "order_total_lte":
      return cart.subtotal < Number(cond.value);
    case "order_weight_gte":
      return cart.weight >= Number(cond.value);
    case "order_weight_lte":
      return cart.weight < Number(cond.value);
    case "quantity_gte":
      return cart.quantity >= Number(cond.value);
    case "quantity_lte":
      return cart.quantity < Number(cond.value);
    case "cart_contains":
      return cart.productHandles.has(String(cond.value).trim().toLowerCase());
    case "cart_not_contains":
      return !cart.productHandles.has(String(cond.value).trim().toLowerCase());
    default:
      return true;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop")?.trim().toLowerCase();

  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400, headers: CORS });
  }

  const cart = parseCart(req);

  const rates = await prisma.shippingRate.findMany({
    where: { shop, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      conditions: true,
      countriesEnabled: true,
      countries: true,
      provincesEnabled: true,
      provinces: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  /* Filter rates against the storefront cart context. A rate is eligible when:
       - country restriction is off, OR the cart's country is in the list
       - province restriction is off, OR the cart's province is in the list
       - every saved condition passes against the cart context
     This mirrors how Shopify itself evaluates rate conditions, so the form
     never offers a shipping option Shopify would later reject. */
  const eligible = rates.filter((r) => {
    if (r.countriesEnabled) {
      const allowed = asStringArray(r.countries).map((c) => c.toUpperCase());
      if (!cart.country || !allowed.includes(cart.country)) return false;
    }

    if (r.provincesEnabled) {
      const allowed = asStringArray(r.provinces).map((p) => p.toUpperCase());
      if (!cart.province || !allowed.includes(cart.province)) return false;
    }

    const stored = Array.isArray(r.conditions) ? r.conditions : [];
    for (const raw of stored) {
      if (!isValidCondition(raw)) continue;
      if (!conditionPasses(raw, cart)) return false;
    }

    return true;
  });

  const serialized = eligible.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    currency: r.currency,
  }));

  return NextResponse.json({ rates: serialized }, { headers: CORS });
}
