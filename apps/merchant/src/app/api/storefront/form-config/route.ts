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

  const config = await prisma.formDesignConfig.findUnique({
    where: { shop },
    select: {
      formType: true,
      fields: true,
      formBgColor: true,
      formTextColor: true,
      formBorderColor: true,
      formBorderRadiusPx: true,
      formBorderWidthPx: true,
      formShadowPx: true,
      formPaddingPx: true,
      formTextBold: true,
      formTextItalic: true,
      fieldBgColor: true,
      fieldTextColor: true,
      fieldBorderColor: true,
      fieldBorderRadiusPx: true,
      fieldFontSizePx: true,
      textAlign: true,
      hideLabels: true,
      showIcons: true,
      rtl: true,
      autocomplete: true,
      stickyMobile: true,
      errorRequired: true,
      errorInvalid: true,
      errorSoldOut: true,
      isVisible: true,
    },
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404, headers: CORS });
  }

  return NextResponse.json(config, { headers: CORS });
}
