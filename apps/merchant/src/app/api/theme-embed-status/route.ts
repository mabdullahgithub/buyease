import { NextResponse } from "next/server";

import { withGuards } from "@/lib/middleware-stack";

const EXTENSION_HANDLE = "cod-form";

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

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  try {
    const { shop, session } = ctx;
    const accessToken = session.accessToken ?? "";

    if (!accessToken) {
      return NextResponse.json({ enabled: false });
    }

    const themesRes = await fetch(`https://${shop}/admin/api/2026-04/themes.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    if (!themesRes.ok) {
      return NextResponse.json({ enabled: false });
    }

    const themesData = (await themesRes.json()) as ThemesResponse;
    const mainTheme = themesData.themes.find((t) => t.role === "main");

    if (!mainTheme) {
      return NextResponse.json({ enabled: false });
    }

    const assetRes = await fetch(
      `https://${shop}/admin/api/2026-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } },
    );

    if (!assetRes.ok) {
      return NextResponse.json({ enabled: false });
    }

    const assetData = (await assetRes.json()) as ThemeAssetsResponse;
    const content = assetData.asset?.value;

    if (!content) {
      return NextResponse.json({ enabled: false });
    }

    const settings = JSON.parse(content) as SettingsData;
    const blocks = settings.current?.blocks ?? {};

    const enabled = Object.values(blocks).some(
      (block) =>
        typeof block.type === "string" &&
        block.type.includes(`/${EXTENSION_HANDLE}`) &&
        block.disabled !== true,
    );

    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: false });
  }
});
