import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";

import { normalizePlanKey, type PlanKey } from "@/lib/billing";
import { prisma } from "@/lib/db";
import { checkMaintenance } from "@/lib/maintenance";
import { getOrderCount } from "@/lib/order-counter";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { withSessionVerification } from "@/lib/verify-session";

type PlanFeature = "whatsappOtp" | "abTesting" | "advancedFraud";

type RouteContext = {
  shop: string;
  session: Session;
  planKey: PlanKey;
  ordersRemaining: number | null;
};

type ProtectedHandler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>;

type GuardOptions = {
  requiredFeature?: PlanFeature;
  checkOrderLimit?: boolean;
  skipPlanGate?: boolean;
};

function extractFeatures(raw: unknown): Record<string, boolean> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, boolean>;
  }
  return {};
}

function extractOrderLimit(raw: unknown): number | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const limits = raw as Record<string, unknown>;
    if (limits.orderLimit === null || limits.orderLimit === undefined) return null;
    const num = Number(limits.orderLimit);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

/**
 * Full middleware stack for merchant API routes:
 *   1. Maintenance mode check (DB-driven, 10s in-memory cache)
 *   2. Session verification (JWT decode + cache/exchange)
 *   3. Plan gate: active check, feature check, order limit check
 *
 * Usage:
 *   export const POST = withGuards({ checkOrderLimit: true }, async (req, ctx) => { ... });
 *   export const GET = withGuards({}, async (req, ctx) => { ... });
 *   export const GET = withGuards({ skipPlanGate: true }, async (req, ctx) => { ... });
 */
export function withGuards(options: GuardOptions, handler: ProtectedHandler) {
  return withSessionVerification(async (req: NextRequest, session: Session): Promise<NextResponse> => {
    const maintenanceResponse = await checkMaintenance();
    if (maintenanceResponse) return maintenanceResponse;

    if (options.skipPlanGate) {
      return handler(req, {
        shop: session.shop,
        session,
        planKey: "free",
        ordersRemaining: null,
      });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { shop: session.shop },
      select: {
        isActive: true,
        billingCycleStart: true,
        plan: { select: { name: true, features: true, limits: true } },
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "Merchant not found or inactive", reauth: true },
        { status: 401 },
      );
    }

    const planKey = normalizePlanKey(merchant.plan?.name ?? "free");
    const features = extractFeatures(merchant.plan?.features);
    const orderLimit = extractOrderLimit(merchant.plan?.limits);

    if (options.requiredFeature) {
      const hasFeature = features[options.requiredFeature] === true;
      if (!hasFeature) {
        const upgradeUrl = `${merchantAppOrigin()}/billing`;
        return NextResponse.json(
          {
            error: "Plan limit exceeded",
            message: "Your current plan does not include this feature. Please upgrade to access it.",
            currentPlan: planKey,
            feature: options.requiredFeature,
            upgradeUrl,
          },
          { status: 402, headers: { "X-Upgrade-Url": upgradeUrl } },
        );
      }
    }

    let ordersRemaining: number | null = null;

    if (options.checkOrderLimit && orderLimit !== null) {
      const currentCount = await getOrderCount(session.shop, merchant.billingCycleStart);

      if (currentCount >= orderLimit) {
        const upgradeUrl = `${merchantAppOrigin()}/billing`;
        return NextResponse.json(
          {
            error: "Plan limit exceeded",
            message: `You have reached your plan's order limit (${orderLimit} orders/month). Please upgrade to continue processing orders.`,
            currentPlan: planKey,
            upgradeUrl,
          },
          { status: 402, headers: { "X-Upgrade-Url": upgradeUrl } },
        );
      }

      ordersRemaining = orderLimit - currentCount;
    }

    return handler(req, { shop: session.shop, session, planKey, ordersRemaining });
  });
}
