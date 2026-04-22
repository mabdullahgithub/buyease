import { db } from "@buyease/db";
import { shopifySessionStorage } from "@/lib/shopify";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

/**
 * Live Theme App Embed status for BuyEase.
 *
 * BFS requires accurate surfacing of theme embed state — never a hardcoded
 * "Inactive" badge. We read the merchant's active theme `settings_data.json`
 * from Shopify Admin REST and look for our extension's embed block. A block
 * that exists and is not `disabled` is considered active.
 *
 * Environment:
 *   SHOPIFY_THEME_EXTENSION_ID  — UUID of the theme app extension (from
 *   Partner Dashboard). When unset, we surface an honest "unknown" state
 *   so the UI can explain the situation to the merchant instead of lying.
 */

export type ThemeAppEmbedStatus =
  | { state: "active"; themeId: number; themeName: string }
  | { state: "inactive"; themeId: number; themeName: string }
  | { state: "unknown"; reason: "missing_session" | "missing_extension_id" | "api_error" };

type RestThemesResponse = {
  themes?: Array<{ id: number; name: string; role: string }>;
};

type RestAssetResponse = {
  asset?: { value?: string };
};

type ThemeSettingsData = {
  current?:
    | string
    | {
        blocks?: Record<string, { type?: string; disabled?: boolean }>;
      };
  presets?: Record<
    string,
    { blocks?: Record<string, { type?: string; disabled?: boolean }> }
  >;
};

async function getLatestAccessToken(shop: string): Promise<string | null> {
  const normalized = shop.trim().toLowerCase();
  const session = await db.session.findFirst({
    where: { shop: normalized, isOnline: false },
    orderBy: { updatedAt: "desc" },
    select: { accessToken: true },
  });
  if (session?.accessToken) {
    return session.accessToken;
  }
  const sessions = await shopifySessionStorage.findSessionsByShop(normalized);
  const offline = sessions.find((s) => !s.isOnline && s.accessToken);
  return offline?.accessToken ?? null;
}

async function shopifyRestGet<T>(
  shop: string,
  accessToken: string,
  path: string
): Promise<T | null> {
  const url = `https://${shop}/admin/api/${LATEST_API_VERSION}/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[theme-app-embed] REST non-200", { path, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn("[theme-app-embed] REST fetch failed", { path, error });
    return null;
  }
}

function embedBlockIsActive(
  settings: ThemeSettingsData | null,
  extensionId: string
): boolean {
  if (!settings) return false;
  // Blocks added by an app extension are keyed by `shopify://apps/.../{uuid}`
  // in both `current` (when it's an object) and theme presets.
  const matcher = new RegExp(`/${extensionId}($|/)`);

  const checkBlocks = (
    blocks?: Record<string, { type?: string; disabled?: boolean }>
  ): boolean => {
    if (!blocks) return false;
    return Object.values(blocks).some(
      (block) => typeof block?.type === "string" && matcher.test(block.type) && block.disabled !== true
    );
  };

  if (settings.current && typeof settings.current === "object") {
    if (checkBlocks(settings.current.blocks)) return true;
  }
  if (settings.presets) {
    for (const preset of Object.values(settings.presets)) {
      if (checkBlocks(preset?.blocks)) return true;
    }
  }
  return false;
}

/**
 * Resolves the active main theme, fetches its settings_data.json, and returns
 * whether the BuyEase theme app embed block is currently enabled on it.
 */
export async function getThemeAppEmbedStatus(shop: string): Promise<ThemeAppEmbedStatus> {
  const normalizedShop = shop.trim().toLowerCase();
  const extensionId = process.env.SHOPIFY_THEME_EXTENSION_ID?.trim();
  if (!extensionId) {
    return { state: "unknown", reason: "missing_extension_id" };
  }

  const accessToken = await getLatestAccessToken(normalizedShop);
  if (!accessToken) {
    return { state: "unknown", reason: "missing_session" };
  }

  const themes = await shopifyRestGet<RestThemesResponse>(
    normalizedShop,
    accessToken,
    "themes.json?role=main"
  );
  const mainTheme = themes?.themes?.find((t) => t.role === "main") ?? themes?.themes?.[0];
  if (!mainTheme) {
    return { state: "unknown", reason: "api_error" };
  }

  const asset = await shopifyRestGet<RestAssetResponse>(
    normalizedShop,
    accessToken,
    `themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`
  );
  if (!asset?.asset?.value) {
    return { state: "unknown", reason: "api_error" };
  }

  let parsed: ThemeSettingsData | null = null;
  try {
    parsed = JSON.parse(asset.asset.value) as ThemeSettingsData;
  } catch {
    return { state: "unknown", reason: "api_error" };
  }

  return {
    state: embedBlockIsActive(parsed, extensionId) ? "active" : "inactive",
    themeId: mainTheme.id,
    themeName: mainTheme.name,
  };
}
