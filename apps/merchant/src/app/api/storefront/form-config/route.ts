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

  const defaults = {
    formType: "popup",
    fields: [
      { id: "header", type: "header", title: "Please fill in the form to order", deletable: false, hidden: false },
      { id: "cart", type: "cart", title: "Your Cart", deletable: false, hidden: false },
      { id: "summary", type: "summary", title: "Order Summary", deletable: false, hidden: false },
      { id: "shipping", type: "shipping", title: "Shipping Method", deletable: false, hidden: false },
      { id: "first_name", type: "input", title: "First Name", placeholder: "Enter your first name", required: true, iconId: "user", deletable: true, hidden: false },
      { id: "phone", type: "input", title: "Phone", placeholder: "Enter your phone number", required: true, iconId: "phone", deletable: true, hidden: false },
      { id: "address", type: "input", title: "Address", placeholder: "Enter your full address", required: true, iconId: "map-pin", deletable: true, hidden: false },
      { id: "city", type: "input", title: "City", placeholder: "Enter your city", required: true, iconId: "building", deletable: true, hidden: false },
      { id: "postal_code", type: "input", title: "Postal Code", placeholder: "Enter your postal code", required: true, iconId: null, deletable: true, hidden: false },
      { id: "marketing_checkbox", type: "checkbox", title: "I agree to receive marketing messages", required: false, deletable: true, hidden: false },
      { id: "submit", type: "submit", title: "BUY IT NOW - {total}", deletable: false, hidden: false },
    ],
    formBgColor: "#FFFFFF",
    formTextColor: "#000000",
    formBorderColor: "#E5E5E5",
    formBorderRadiusPx: 12,
    formBorderWidthPx: 1,
    formShadowPx: 8,
    formPaddingPx: 24,
    formTextBold: false,
    formTextItalic: false,
    fieldBgColor: "#FFFFFF",
    fieldTextColor: "#000000",
    fieldBorderColor: "#D1D5DB",
    fieldBorderRadiusPx: 6,
    fieldFontSizePx: 14,
    textAlign: "left",
    hideLabels: false,
    showIcons: true,
    rtl: false,
    autocomplete: true,
    stickyMobile: true,
    errorRequired: "This field is required",
    errorInvalid: "Please enter a valid value",
    errorSoldOut: "This product is sold out",
    isVisible: true,
  };

  return NextResponse.json(config ?? defaults, { headers: CORS });
}
