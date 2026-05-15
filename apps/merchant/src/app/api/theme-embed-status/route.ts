import { NextResponse } from "next/server";

import { withGuards } from "@/lib/middleware-stack";

// Extension UID from shopify.extension.toml — unique across all apps/shops.
const EXTENSION_UID = "279c058d-e2b0-785d-0abc-9c4482a708772fe4d69a";

// App client_id from shopify.app.toml — used as app identifier in block keys.
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
  // Shopify stores app embed blocks with keys like:
  //   shopify://apps/{app_handle}/blocks/{block_file}/{ext_uid}
  // OR using the client_id directly in some formats.
  // The extension UID is globally unique — safest primary identifier.
  // The client_id (APP_CLIENT_ID) is the app-level secondary identifier.
  if (key.includes(EXTENSION_UID)) return true;
  if (APP_CLIENT_ID && key.includes(APP_CLIENT_ID)) return true;
  if (typeof block.type === "string") {
    if (block.type.includes(EXTENSION_UID)) return true;
    if (APP_CLIENT_ID && block.type.includes(APP_CLIENT_ID)) return true;
  }
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

    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: null, reason: "exception" });
  }
});
