import { NextRequest, NextResponse } from "next/server";

import { Redis } from "ioredis";

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
};

// ─── Google global config cache (30-second TTL, Redis-backed) ────────────────
// Kept separate from the per-shop LRU so that admin-side changes to the API key
// or the isEnabled toggle propagate to storefronts within 30 seconds without
// needing cross-process cache invalidation.
//
// Redis is used (instead of a process-local variable) so the cache is shared
// across all serverless instances. A process-local fallback would cause a DB
// query on every invocation in Vercel serverless, where each invocation is a
// fresh process with no warm module state.
//
// SECURITY NOTE: The API key returned here is sent to browser clients so the
// Google Places script can load. You MUST restrict this key in the Google Cloud
// Console to HTTP referrer restrictions (e.g. *.myshopify.com/* and any custom
// domains) to prevent unauthorised use and unexpected billing charges.
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) _redis = new Redis(process.env.REDIS_URL!);
  return _redis;
}

const GOOGLE_GLOBAL_REDIS_KEY = "buyease:google:global";
const GOOGLE_GLOBAL_TTL_S = 30;

async function fetchGoogleGlobalConfig(): Promise<{ apiKey: string | null; isEnabled: boolean }> {
  try {
    const cached = await getRedis().get(GOOGLE_GLOBAL_REDIS_KEY);
    if (cached) return JSON.parse(cached) as { apiKey: string | null; isEnabled: boolean };
  } catch { /* Redis unavailable — fall through to DB */ }

  const cfg = await prisma.googleAutocompleteGlobalConfig.findUnique({
    where: { id: 1 },
    select: { apiKey: true, isEnabled: true },
  });
  const result = { apiKey: cfg?.apiKey?.trim() || null, isEnabled: cfg?.isEnabled ?? true };

  try {
    await getRedis().setex(GOOGLE_GLOBAL_REDIS_KEY, GOOGLE_GLOBAL_TTL_S, JSON.stringify(result));
  } catch { /* Redis write failure is non-fatal */ }

  return result;
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const shop = req.nextUrl.searchParams.get("shop")?.trim().toLowerCase();

  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop" }, { status: 400, headers: CORS });
  }

  // ── Build base config (without Google runtime fields) ─────────────────────
  // The LRU stores the per-shop form config plus a private `__googleAcEnabled`
  // flag. Google runtime fields (API key, enabled status) are NOT stored in the
  // LRU — they are computed fresh from the 30s global config cache on every
  // request so admin changes propagate quickly.

  let base: Record<string, unknown>;

  const cached = getCachedFormConfig(shop);
  if (cached) {
    base = cached;
  } else {
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

    base = (config ?? DEFAULTS) as Record<string, unknown>;

    // Stash the merchant's toggle as a private cache field.
    // This is stripped before sending the response to the client.
    base.__googleAcEnabled = config?.googleAutocomplete ?? false;

    // Per-shop Google settings (merchant preferences — safe to cache in LRU).
    base.googleAcCountries      = config?.googleAcCountries      ?? [];
    base.googleAcLanguage       = config?.googleAcLanguage        ?? null;
    base.googleAcPlaceType      = config?.googleAcPlaceType       ?? "address";
    base.googleAcFillCity       = config?.googleAcFillCity        ?? true;
    base.googleAcFillPostalCode = config?.googleAcFillPostalCode  ?? true;
    base.googleAcFillProvince   = config?.googleAcFillProvince    ?? true;
    base.googleAcFillCountry    = config?.googleAcFillCountry     ?? true;
    base.googleAcMapPicker      = config?.googleAcMapPicker       ?? false;
    base.googleAcAutoLocate     = config?.googleAcAutoLocate      ?? false;

    // Remove fields that must NOT be persisted in the LRU.
    delete base.googleAutocomplete; // replaced by __googleAcEnabled
    delete base.googlePlacesEnabled; // computed fresh on every response
    delete base.googlePlacesApiKey;  // computed fresh on every response

    setCachedFormConfig(shop, base);
  }

  // ── Compute Google runtime fields (always fresh, never from LRU) ──────────
  const googleGlobal = await fetchGoogleGlobalConfig();
  const merchantEnabled = (base.__googleAcEnabled as boolean | undefined) ?? false;
  const apiKey = googleGlobal.apiKey || (process.env.GOOGLE_PLACES_API_KEY ?? "");
  const googlePlacesEnabled = merchantEnabled && googleGlobal.isEnabled && !!apiKey;

  // Clone before mutating so the LRU-cached object is never modified.
  const response: Record<string, unknown> = { ...base };
  delete response.__googleAcEnabled;
  response.googlePlacesEnabled = googlePlacesEnabled;
  response.googlePlacesApiKey  = googlePlacesEnabled ? apiKey : undefined;

  return NextResponse.json(response, {
    headers: { ...CORS, "Cache-Control": CACHE_CONTROL },
  });
}
