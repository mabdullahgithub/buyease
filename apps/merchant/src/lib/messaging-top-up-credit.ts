import { Prisma } from "@buyease/db";

import { prisma } from "@/lib/db";
import shopify, { sessionStorage } from "@/lib/shopify";

const ADMIN_GRAPHQL_API_VERSION_PATH = "2026-04";
const ONE_TIME_POLL_ATTEMPTS = 12;
const ONE_TIME_POLL_BASE_DELAY_MS = 500;

const ONE_TIME_CHARGE_QUERY = `
query OneTimeCharge($id: ID!) {
  node(id: $id) {
    ... on AppPurchaseOneTime {
      id
      status
      amount { amount currencyCode }
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
  amount: { amount: string; currencyCode: string };
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
  if (!node?.amount) {
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

  const amount = parseFloat(active.amount.amount);
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

export async function resolveOfflineMerchantAccessToken(shopRaw: string): Promise<string | null> {
  const shop = normalizeShopForMerchantDb(shopRaw);
  const session = await prisma.session.findFirst({
    where: { shop, isOnline: false },
    select: { accessToken: true },
    orderBy: { updatedAt: "desc" },
  });
  if (session?.accessToken) {
    return session.accessToken;
  }

  const sessions = await sessionStorage.findSessionsByShop(shop);
  const offline = sessions.find((s) => !s.isOnline && s.accessToken);
  if (offline?.accessToken) {
    return offline.accessToken;
  }

  // Final fallback: token stored on the Merchant row during installation
  const merchant = await prisma.merchant.findUnique({
    where: { shop },
    select: { accessToken: true },
  });
  return merchant?.accessToken ?? null;
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
