import { NextResponse } from "next/server";

import { withGuards } from "@/lib/middleware-stack";

// Extension UID as deployed to Shopify — visible in live theme settings_data.json.
// Note: differs from the UID in shopify.extension.toml (279c058d…) which is the dev UID.
const EXTENSION_UID = "019e0927-5422-7577-9e47-31bfe4c3a489";

// App handle — used as primary identifier in block type URLs.
const APP_HANDLE = "buyease-cod-form";

// App client_id from shopify.app.toml — secondary fallback identifier.
const APP_CLIENT_ID = process.env.SHOPIFY_API_KEY ?? "";

type ShopifyTheme = {
  id: number;
  role: string;
};

type ThemesResponse = {
  themes: ShopifyTheme[];
};

type ThemeAssetsResponse = {
  asset?: { value?: string };
};

type SettingsBlock = {
  type?: string;
  disabled?: boolean;
};

type SettingsData = {
  current?: {
    blocks?: Record<string, SettingsBlock>;
  };
};

function isBuyEaseBlock(key: string, block: SettingsBlock): boolean {
  const haystack = key + "|" + (block.type ?? "");
  if (haystack.includes(EXTENSION_UID)) return true;
  if (haystack.includes(APP_HANDLE)) return true;
  if (APP_CLIENT_ID && haystack.includes(APP_CLIENT_ID)) return true;
  return false;
}

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  try {
    const { shop, session } = ctx;
    const accessToken = session.accessToken ?? "";

    if (!accessToken) {
      return NextResponse.json({ enabled: null, reason: "no_token" });
    }

    const themesRes = await fetch(`https://${shop}/admin/api/2026-04/themes.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    if (!themesRes.ok) {
      // 403 = missing read_themes scope; treat as unknown, not false
      return NextResponse.json({ enabled: null, reason: `themes_api_${themesRes.status}` });
    }

    const themesData = (await themesRes.json()) as ThemesResponse;
    const mainTheme = themesData.themes.find((t) => t.role === "main");

    if (!mainTheme) {
      return NextResponse.json({ enabled: null, reason: "no_main_theme" });
    }

    const assetRes = await fetch(
      `https://${shop}/admin/api/2026-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } },
    );

    if (!assetRes.ok) {
      return NextResponse.json({ enabled: null, reason: `asset_api_${assetRes.status}` });
    }

    const assetData = (await assetRes.json()) as ThemeAssetsResponse;
    const content = assetData.asset?.value;

    if (!content) {
      return NextResponse.json({ enabled: null, reason: "no_content" });
    }

    const settings = JSON.parse(content) as SettingsData;
    const blocks = settings.current?.blocks ?? {};

    const enabled = Object.entries(blocks).some(
      ([key, block]) => isBuyEaseBlock(key, block) && block.disabled !== true,
    );

    if (!enabled) {
      return NextResponse.json({ enabled: false, reason: "block_not_matched" });
    }

    return NextResponse.json({ enabled: true });
  } catch {
    return NextResponse.json({ enabled: null, reason: "exception" });
  }
});
