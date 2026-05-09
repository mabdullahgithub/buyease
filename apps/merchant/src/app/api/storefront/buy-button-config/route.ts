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

  const defaults = {
    buttonText: "Order via COD",
    buttonSubtitle: null,
    iconId: "cart",
    iconAlign: "start",
    showIcon: true,
    animation: "none",
    stickyPosition: "off",
    stickyMobile: true,
    mobileFullWidth: false,
    bgColor: "#000000",
    textColor: "#FFFFFF",
    borderColor: "#000000",
    fontSizePx: 16,
    borderRadiusPx: 8,
    borderWidthPx: 0,
    shadowStrength: 0,
    isBold: false,
    isItalic: false,
    isVisible: true,
  };

  return NextResponse.json(config ?? defaults, { headers: CORS });
}
