import { NextResponse } from "next/server";

import { withGuards } from "@/lib/middleware-stack";

type ShopifyTheme = {
  id: number;
  role: string;
  name: string;
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
  [key: string]: unknown;
};

type SettingsData = {
  current?: {
    blocks?: Record<string, SettingsBlock>;
  };
};

/**
 * TEMPORARY DEBUG ENDPOINT — remove after the embed-status detection is confirmed working.
 *
 * Returns the raw blocks from config/settings_data.json of the active theme,
 * plus env diagnostics, so we can verify the block key format Shopify uses.
 *
 * Call: GET /api/debug/theme-blocks
 */
export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const { shop, session } = ctx;
  const accessToken = session.accessToken ?? "";

  const diagnostics: Record<string, unknown> = {
    shop,
    hasAccessToken: Boolean(accessToken),
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ?? "(not set)",
    EXTENSION_UID_HARDCODED: "279c058d-e2b0-785d-0abc-9c4482a708772fe4d69a",
  };

  if (!accessToken) {
    return NextResponse.json({ error: "no_access_token", diagnostics });
  }

  const themesRes = await fetch(`https://${shop}/admin/api/2026-04/themes.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  if (!themesRes.ok) {
    const body = await themesRes.text().catch(() => "(unreadable)");
    return NextResponse.json({
      error: "themes_api_failed",
      status: themesRes.status,
      body,
      diagnostics,
    });
  }

  const themesData = (await themesRes.json()) as ThemesResponse;
  const themes = themesData.themes.map((t) => ({ id: t.id, role: t.role, name: t.name }));
  const mainTheme = themesData.themes.find((t) => t.role === "main");

  if (!mainTheme) {
    return NextResponse.json({ error: "no_main_theme", themes, diagnostics });
  }

  const assetRes = await fetch(
    `https://${shop}/admin/api/2026-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
    { headers: { "X-Shopify-Access-Token": accessToken } },
  );

  if (!assetRes.ok) {
    return NextResponse.json({
      error: "asset_api_failed",
      status: assetRes.status,
      mainThemeId: mainTheme.id,
      diagnostics,
    });
  }

  const assetData = (await assetRes.json()) as ThemeAssetsResponse;
  const content = assetData.asset?.value;

  if (!content) {
    return NextResponse.json({ error: "no_content", mainThemeId: mainTheme.id, diagnostics });
  }

  const settings = JSON.parse(content) as SettingsData;
  const blocks = settings.current?.blocks ?? {};

  // Return all block keys + type fields so we can see the exact format Shopify uses.
  const blockSummary = Object.entries(blocks).map(([key, block]) => ({
    key,
    type: block.type,
    disabled: block.disabled,
  }));

  return NextResponse.json({
    mainThemeId: mainTheme.id,
    blockCount: blockSummary.length,
    blocks: blockSummary,
    diagnostics,
  });
});
