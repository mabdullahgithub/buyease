import { Session } from "@shopify/shopify-api";
import { Prisma } from "@buyease/db";

import { prisma } from "@/lib/db";
import shopify, { sessionStorage } from "@/lib/shopify";
import { ensureFreshToken } from "@/lib/token-refresh";

const ADMIN_GRAPHQL_API_VERSION_PATH = "2026-04";
const ONE_TIME_POLL_ATTEMPTS = 12;
const ONE_TIME_POLL_BASE_DELAY_MS = 500;

const ONE_TIME_CHARGE_QUERY = `
query OneTimeCharge($id: ID!) {
  node(id: $id) {
    ... on AppPurchaseOneTime {
      id
      status
      price { amount currencyCode }
    }
  }
}`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Aligns callback/webhook shop with rows created via session (sanitizeShop + lowercase fallback). */
export function normalizeShopForMerchantDb(shop: string): string {
  const sanitized = shopify.utils.sanitizeShop(shop, true);
  if (sanitized) {
    return sanitized;
  }
  return shop.trim().toLowerCase();
}

export function toAppPurchaseOneTimeGid(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("gid://shopify/AppPurchaseOneTime/")) {
    return trimmed;
  }
  return `gid://shopify/AppPurchaseOneTime/${trimmed}`;
}

function isPaidOneTimePurchaseStatus(status: string): boolean {
  const s = status.trim().toUpperCase();
  return s === "ACTIVE" || s === "ACCEPTED";
}

type OneTimeChargeNode = {
  id: string;
  status: string;
  price: { amount: string; currencyCode: string };
};

async function fetchOneTimePurchase(
  shopDomain: string,
  accessToken: string,
  purchaseGid: string,
): Promise<OneTimeChargeNode | null> {
  const response = await fetch(
    `https://${shopDomain}/admin/api/${ADMIN_GRAPHQL_API_VERSION_PATH}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: ONE_TIME_CHARGE_QUERY,
        variables: { id: purchaseGid },
      }),
    },
  );

  if (!response.ok) {
    console.error(
      `fetchOneTimePurchase: ${response.status} ${response.statusText} from Shopify API for ${shopDomain}`,
    );
    return null;
  }

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string }>;
    data?: { node?: OneTimeChargeNode | null };
  };

  if (payload.errors && payload.errors.length > 0) {
    return null;
  }

  const node = payload.data?.node;
  if (!node?.price) {
    return null;
  }

  return node;
}

export async function pollOneTimePurchaseUntilActive(
  shopDomain: string,
  accessToken: string,
  purchaseGid: string,
): Promise<OneTimeChargeNode | null> {
  for (let attempt = 0; attempt < ONE_TIME_POLL_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(ONE_TIME_POLL_BASE_DELAY_MS * attempt);
    }
    const node = await fetchOneTimePurchase(shopDomain, accessToken, purchaseGid);
    if (node && isPaidOneTimePurchaseStatus(node.status)) {
      return node;
    }
  }
  return null;
}

function isPrismaUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export type MessagingTopUpCreditOutcome =
  | { ok: true; reason: "credited" }
  | { ok: true; reason: "already_credited" }
  | { ok: false; reason: "not_active_yet" };

/**
 * After a one-time app purchase is approved, polls until ACTIVE then credits {@link Merchant.balance}
 * once per Shopify purchase id (safe if return URL and webhook both run).
 */
export async function creditMerchantBalanceForActivatedOneTimePurchase(
  shopDomainRaw: string,
  accessToken: string,
  rawChargeIdOrGid: string,
): Promise<MessagingTopUpCreditOutcome> {
  const shopDomain = normalizeShopForMerchantDb(shopDomainRaw);
  const purchaseGid = toAppPurchaseOneTimeGid(rawChargeIdOrGid);
  const active = await pollOneTimePurchaseUntilActive(shopDomain, accessToken, purchaseGid);
  if (!active) {
    return { ok: false, reason: "not_active_yet" };
  }

  const amount = parseFloat(active.price.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "not_active_yet" };
  }

  try {
    await prisma.$transaction([
      prisma.processedAppOneTimePurchase.create({
        data: {
          purchaseGid: active.id,
          shop: shopDomain,
          amountUsd: amount,
        },
      }),
      prisma.merchant.upsert({
        where: { shop: shopDomain },
        create: {
          shop: shopDomain,
          isActive: true,
          balance: amount,
        },
        update: {
          balance: { increment: amount },
          isActive: true,
          uninstalledAt: null,
        },
      }),
    ]);

    await prisma.messagingTopUpIntent.updateMany({
      where: { purchaseGid: active.id },
      data: { consumedAt: new Date() },
    });
  } catch (error: unknown) {
    if (isPrismaUniqueViolation(error)) {
      return { ok: true, reason: "already_credited" };
    }
    throw error;
  }

  return { ok: true, reason: "credited" };
}

/** Returns a valid (non-expired) offline access token for the shop, refreshing it if needed. */
export async function resolveOfflineMerchantAccessToken(shopRaw: string): Promise<string | null> {
  const shop = normalizeShopForMerchantDb(shopRaw);

  // Try the Session DB row first — it has full expiry metadata for ensureFreshToken.
  const dbSession = await prisma.session.findFirst({
    where: { shop, isOnline: false },
    orderBy: { updatedAt: "desc" },
  });

  if (dbSession?.accessToken) {
    const session = new Session({
      id: dbSession.id,
      shop: dbSession.shop,
      state: dbSession.state ?? "",
      isOnline: false,
      scope: dbSession.scope ?? undefined,
      expires: dbSession.expires ?? undefined,
      accessToken: dbSession.accessToken,
    });
    try {
      const fresh = await ensureFreshToken(session);
      return fresh.accessToken ?? null;
    } catch {
      // Token refresh failed — fall through to other sources.
    }
  }

  // Try Redis sessionStorage.
  const redisSessions = await sessionStorage.findSessionsByShop(shop);
  const offline = redisSessions.find((s) => !s.isOnline && s.accessToken);
  if (offline?.accessToken) {
    try {
      const fresh = await ensureFreshToken(offline);
      return fresh.accessToken ?? null;
    } catch {
      // Fall through to Merchant row.
    }
  }

  // Final fallback: token stored on the Merchant row during installation.
  const merchant = await prisma.merchant.findUnique({
    where: { shop },
    select: { accessToken: true, tokenExpiresAt: true, refreshToken: true },
  });

  if (!merchant?.accessToken) {
    return null;
  }

  // If the Merchant token is still fresh, use it directly.
  const expiresAt = merchant.tokenExpiresAt;
  const isExpired = expiresAt && expiresAt.getTime() - Date.now() < 5 * 60 * 1000;
  if (!isExpired) {
    return merchant.accessToken;
  }

  // Expired: refresh using the stored refresh token.
  if (!merchant.refreshToken) {
    console.error(`resolveOfflineMerchantAccessToken: expired token, no refresh token for ${shop}`);
    return null;
  }

  try {
    const refreshUrl = `https://${shop}/admin/oauth/access_token`;
    const body = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY!,
      client_secret: process.env.SHOPIFY_API_SECRET!,
      grant_type: "refresh_token",
      refresh_token: merchant.refreshToken,
    });
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: body.toString(),
    });
    if (!res.ok) {
      console.error(`resolveOfflineMerchantAccessToken: token refresh failed [${res.status}] for ${shop}`);
      return null;
    }
    const data = (await res.json()) as { access_token: string; expires_in?: number; refresh_token?: string };
    const newExpiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined;
    await prisma.merchant.updateMany({
      where: { shop },
      data: {
        accessToken: data.access_token,
        ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
        ...(newExpiresAt ? { tokenExpiresAt: newExpiresAt } : {}),
      },
    });
    return data.access_token;
  } catch (error) {
    console.error(`resolveOfflineMerchantAccessToken: refresh threw for ${shop}`, error);
    return null;
  }
}

/** When Shopify omits charge_id on the billing return URL, use the latest pending intent for this shop. */
export async function resolvePendingTopUpPurchaseGid(shopRaw: string): Promise<string | null> {
  const shop = normalizeShopForMerchantDb(shopRaw);
  const row = await prisma.messagingTopUpIntent.findFirst({
    where: { shop, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { purchaseGid: true },
  });
  return row?.purchaseGid ?? null;
}

export function parseAppPurchasesOneTimeWebhookBody(rawBody: string): {
  adminGraphqlApiId?: string;
  status?: string;
} {
  if (!rawBody.trim()) {
    return {};
  }
  try {
    const data = JSON.parse(rawBody) as unknown;
    if (!data || typeof data !== "object") {
      return {};
    }
    const root = data as Record<string, unknown>;
    const nested = root["app_purchase_one_time"];
    const source =
      nested && typeof nested === "object"
        ? (nested as Record<string, unknown>)
        : root;
    const adminGraphqlApiId =
      typeof source.admin_graphql_api_id === "string" ? source.admin_graphql_api_id : undefined;
    const status = typeof source.status === "string" ? source.status : undefined;
    return { adminGraphqlApiId, status };
  } catch {
    return {};
  }
}
