import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";

import { normalizePlanKey, type PlanKey } from "@/lib/billing";
import { prisma } from "@/lib/db";
import { getOrderCount } from "@/lib/order-counter";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { withSessionVerification } from "@/lib/verify-session";

type PlanFeature = "whatsappOtp" | "abTesting" | "advancedFraud";

type PlanGateOptions = {
  requiredFeature?: PlanFeature;
  checkOrderLimit?: boolean;
};

type PlanGatedHandler = (
  req: NextRequest,
  session: Session,
  merchant: { shop: string; planKey: PlanKey; ordersRemaining: number | null },
) => Promise<NextResponse>;

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
 * Wraps a session-verified handler with plan enforcement.
 * Checks merchant active status, feature access, and order limits.
 *
 * Returns 402 Payment Required when plan limits are exceeded,
 * with an upgrade URL in the response body.
 */
export function withPlanGate(options: PlanGateOptions, handler: PlanGatedHandler) {
  return withSessionVerification(async (req: NextRequest, session: Session): Promise<NextResponse> => {
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
        return buildUpgradeResponse(
          `Your current plan does not include this feature. Please upgrade to access it.`,
          planKey,
          options.requiredFeature,
        );
      }
    }

    let ordersRemaining: number | null = null;

    if (options.checkOrderLimit && orderLimit !== null) {
      const currentCount = await getOrderCount(session.shop, merchant.billingCycleStart);

      if (currentCount >= orderLimit) {
        return buildUpgradeResponse(
          `You have reached your plan's order limit (${orderLimit} orders/month). Please upgrade to continue processing orders.`,
          planKey,
          undefined,
        );
      }

      ordersRemaining = orderLimit - currentCount;
    }

    return handler(req, session, { shop: session.shop, planKey, ordersRemaining });
  });
}

function buildUpgradeResponse(
  message: string,
  currentPlan: PlanKey,
  feature?: PlanFeature,
): NextResponse {
  const upgradeUrl = `${merchantAppOrigin()}/billing`;

  return NextResponse.json(
    {
      error: "Plan limit exceeded",
      message,
      currentPlan,
      feature: feature ?? null,
      upgradeUrl,
    },
    {
      status: 402,
      headers: { "X-Upgrade-Url": upgradeUrl },
    },
  );
}
