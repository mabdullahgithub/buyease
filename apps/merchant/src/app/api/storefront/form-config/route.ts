import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  getCachedFormConfig,
  setCachedFormConfig,
} from "@/lib/storefront-config-cache";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_CONTROL = "public, max-age=5, stale-while-revalidate=30";

const DEFAULTS = {
  formType: "popup",
  fields: [
    { id: "header",            type: "header",   title: "Please fill in the form to order", deletable: false, hidden: false },
    { id: "cart",              type: "cart",     title: "Your Cart",                        deletable: false, hidden: false },
    { id: "summary",           type: "summary",  title: "Order Summary",                    deletable: false, hidden: false },
    { id: "shipping",          type: "shipping", title: "Shipping Method",                  deletable: false, hidden: false },
    { id: "first_name",        type: "input",    title: "First Name",        placeholder: "Enter your first name",   required: true,  iconId: "user",    deletable: true, hidden: false },
    { id: "phone",             type: "input",    title: "Phone",             placeholder: "Enter your phone number", required: true,  iconId: "phone",   deletable: true, hidden: false },
    { id: "address",           type: "input",    title: "Address",           placeholder: "Enter your full address", required: true,  iconId: "map-pin", deletable: true, hidden: false },
    { id: "city",              type: "input",    title: "City",              placeholder: "Enter your city",         required: true,  iconId: "building",deletable: true, hidden: false },
    { id: "postal_code",       type: "input",    title: "Postal Code",       placeholder: "Enter your postal code",  required: true,  iconId: null,      deletable: true, hidden: false },
    { id: "marketing_checkbox",type: "checkbox", title: "I agree to receive marketing messages",                     required: false, deletable: true, hidden: false },
    { id: "submit",            type: "submit",   title: "BUY IT NOW - {total}",                                      deletable: false, hidden: false },
  ],
  formBgColor:         "#FFFFFF",
  formTextColor:       "#000000",
  formBorderColor:     "#E5E5E5",
  formBorderRadiusPx:  12,
  formBorderWidthPx:   1,
  formShadowPx:        8,
  formPaddingPx:       24,
  formTextBold:        false,
  formTextItalic:      false,
  fieldBgColor:        "#FFFFFF",
  fieldTextColor:      "#000000",
  fieldBorderColor:    "#D1D5DB",
  fieldBorderRadiusPx: 6,
  fieldFontSizePx:     14,
  textAlign:           "left",
  hideLabels:          false,
  showIcons:           true,
  rtl:                 false,
  autocomplete:        true,
  stickyMobile:        true,
  errorRequired:       "This field is required",
  errorInvalid:        "Please enter a valid value",
  errorSoldOut:        "This product is sold out",
  isVisible:               true,
  countriesEnabled:        false,
  countries:               [] as string[],
  productRestrictionMode:  "none",
  restrictedProducts:      [] as unknown[],
  restrictedCollections:   [] as unknown[],
  // ── Settings ──
  formPlacement:           "whole-store",
  hideCheckout:            false,
  hideAddToCart:           false,
  hideBuyNow:              false,
  whenOpened:              "product-and-cart",
  disableInPages:          { homePage: false, collectionPage: false, regularPage: false, searchResultPage: false, cartDrawer: false },
  allowCountriesOnly:      false,
  allowedCountries:        [] as string[],
  enableOrderEligibility:  false,
  orderEligibilityMin:     null,
  orderEligibilityMax:     null,
  showIneligibleMessage:   false,
  ineligibleMessage:       "",
  hideSubmitButton:        false,
  disableOutOfStock:       true,
  disableAllDiscounts:     false,
  disableShopifyDiscount:  false,
  customCss:               "",
  // ── Google Address Autocomplete ──
  googlePlacesEnabled:    false,
  googlePlacesApiKey:     undefined as string | undefined,
  googleAcCountries:      [] as string[],
  googleAcLanguage:       null as string | null,
  googleAcPlaceType:      "address",
  googleAcFillCity:       true,
  googleAcFillPostalCode: true,
  googleAcFillProvince:   true,
  googleAcFillCountry:    true,
  googleAcMapPicker:      false,
  googleAcAutoLocate:     false,
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop")?.trim().toLowerCase();

  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400, headers: CORS });
  }

  const cached = getCachedFormConfig(shop);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { ...CORS, "Cache-Control": CACHE_CONTROL },
    });
  }

  const config = await prisma.formDesignConfig.findUnique({
    where: { shop },
    select: {
      formType:          true,
      fields:            true,
      formBgColor:       true,
      formTextColor:     true,
      formBorderColor:   true,
      formBorderRadiusPx:true,
      formBorderWidthPx: true,
      formShadowPx:      true,
      formPaddingPx:     true,
      formTextBold:      true,
      formTextItalic:    true,
      fieldBgColor:      true,
      fieldTextColor:    true,
      fieldBorderColor:  true,
      fieldBorderRadiusPx:true,
      fieldFontSizePx:   true,
      textAlign:         true,
      hideLabels:        true,
      showIcons:         true,
      rtl:               true,
      autocomplete:      true,
      stickyMobile:      true,
      errorRequired:     true,
      errorInvalid:      true,
      errorSoldOut:      true,
      isVisible:              true,
      countriesEnabled:       true,
      countries:              true,
      productRestrictionMode: true,
      restrictedProducts:     true,
      restrictedCollections:  true,
      // ── Settings ──
      formPlacement:          true,
      hideCheckout:           true,
      hideAddToCart:          true,
      hideBuyNow:             true,
      whenOpened:             true,
      disableInPages:         true,
      allowCountriesOnly:     true,
      allowedCountries:       true,
      enableOrderEligibility: true,
      orderEligibilityMin:    true,
      orderEligibilityMax:    true,
      showIneligibleMessage:  true,
      ineligibleMessage:      true,
      hideSubmitButton:       true,
      disableOutOfStock:      true,
      disableAllDiscounts:    true,
      disableShopifyDiscount: true,
      customCss:              true,
      // ── Google Address Autocomplete ──
      googleAutocomplete:     true,
      googleAcCountries:      true,
      googleAcLanguage:       true,
      googleAcPlaceType:      true,
      googleAcFillCity:       true,
      googleAcFillPostalCode: true,
      googleAcFillProvince:   true,
      googleAcFillCountry:    true,
      googleAcMapPicker:      true,
      googleAcAutoLocate:     true,
    },
  });

  const base = (config ?? DEFAULTS) as Record<string, unknown>;

  if (config?.googleAutocomplete) {
    const globalConfig = await prisma.googleAutocompleteGlobalConfig.findUnique({
      where: { id: 1 },
      select: { apiKey: true, isEnabled: true },
    });
    const adminKey = globalConfig?.apiKey?.trim() || null;
    const envKey = process.env.GOOGLE_PLACES_API_KEY ?? "";
    const apiKey = adminKey || envKey;
    const isGloballyEnabled = globalConfig?.isEnabled ?? true;

    base.googlePlacesEnabled = isGloballyEnabled && !!apiKey;
    base.googlePlacesApiKey = isGloballyEnabled && apiKey ? apiKey : undefined;
    base.googleAcCountries = config.googleAcCountries ?? [];
    base.googleAcLanguage = config.googleAcLanguage ?? null;
    base.googleAcPlaceType = config.googleAcPlaceType ?? "address";
    base.googleAcFillCity = config.googleAcFillCity ?? true;
    base.googleAcFillPostalCode = config.googleAcFillPostalCode ?? true;
    base.googleAcFillProvince = config.googleAcFillProvince ?? true;
    base.googleAcFillCountry = config.googleAcFillCountry ?? true;
    base.googleAcMapPicker = config.googleAcMapPicker ?? false;
    base.googleAcAutoLocate = config.googleAcAutoLocate ?? false;
  } else {
    base.googlePlacesEnabled = false;
    base.googlePlacesApiKey = undefined;
    base.googleAcCountries = [];
    base.googleAcLanguage = null;
    base.googleAcPlaceType = "address";
    base.googleAcFillCity = true;
    base.googleAcFillPostalCode = true;
    base.googleAcFillProvince = true;
    base.googleAcFillCountry = true;
    base.googleAcMapPicker = false;
    base.googleAcAutoLocate = false;
  }

  delete base.googleAutocomplete;

  setCachedFormConfig(shop, base);

  return NextResponse.json(base, {
    headers: { ...CORS, "Cache-Control": CACHE_CONTROL },
  });
}
