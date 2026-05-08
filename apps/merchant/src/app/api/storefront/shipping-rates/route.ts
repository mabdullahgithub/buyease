import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop")?.trim().toLowerCase();

  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400, headers: CORS });
  }

  const rates = await prisma.shippingRate.findMany({
    where: { shop, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const serialized = rates.map((r) => ({
    ...r,
    price: Number(r.price),
  }));

  return NextResponse.json({ rates: serialized }, { headers: CORS });
}
