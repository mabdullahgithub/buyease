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

  const config = await prisma.buyButtonConfig.findUnique({
    where: { shop },
    select: {
      buttonText: true,
      buttonSubtitle: true,
      iconId: true,
      iconAlign: true,
      showIcon: true,
      animation: true,
      stickyPosition: true,
      stickyMobile: true,
      mobileFullWidth: true,
      bgColor: true,
      textColor: true,
      borderColor: true,
      fontSizePx: true,
      borderRadiusPx: true,
      borderWidthPx: true,
      shadowStrength: true,
      isBold: true,
      isItalic: true,
      isVisible: true,
    },
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404, headers: CORS });
  }

  return NextResponse.json(config, { headers: CORS });
}
