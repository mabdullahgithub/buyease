import { Prisma } from "@buyease/db";

import { prisma } from "@/lib/db";
import { sessionStorage } from "@/lib/shopify";

const ADMIN_GRAPHQL_API_VERSION_PATH = "2026-04";
const ONE_TIME_POLL_ATTEMPTS = 7;
const ONE_TIME_POLL_BASE_DELAY_MS = 400;

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

export function toAppPurchaseOneTimeGid(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("gid://shopify/AppPurchaseOneTime/")) {
    return trimmed;
  }
  return `gid://shopify/AppPurchaseOneTime/${trimmed}`;
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
    if (node && node.status.trim().toUpperCase() === "ACTIVE") {
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
  shopDomain: string,
  accessToken: string,
  rawChargeIdOrGid: string,
): Promise<MessagingTopUpCreditOutcome> {
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
  } catch (error: unknown) {
    if (isPrismaUniqueViolation(error)) {
      return { ok: true, reason: "already_credited" };
    }
    throw error;
  }

  return { ok: true, reason: "credited" };
}

export async function resolveOfflineMerchantAccessToken(shop: string): Promise<string | null> {
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
  return offline?.accessToken ?? null;
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
