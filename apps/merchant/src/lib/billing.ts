export const PLANS = {
  free: {
    name: "Free",
    amount: 0,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 0,
    orderLimit: 60,
  },
  premium: {
    name: "Premium",
    amount: 6.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 0,
    orderLimit: 200,
  },
  enterprise: {
    name: "Enterprise",
    amount: 18.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 0,
    orderLimit: 10000,
  },
  unlimited: {
    name: "Unlimited",
    amount: 43.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 0,
    orderLimit: Infinity,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function normalizePlanKey(value: string): PlanKey {
  const lowered = value.toLowerCase();
  if (lowered === "premium" || lowered === "enterprise" || lowered === "unlimited") {
    return lowered;
  }
  return "free";
}

export function getPlanRecord(planKey: PlanKey): {
  name: string;
  price: number;
  features: Record<string, boolean>;
  limits: { orderLimit: number | null };
} {
  const plan = PLANS[planKey];
  return {
    name: plan.name,
    price: plan.amount,
    features: {
      whatsappOtp: planKey !== "free",
      abTesting: planKey === "unlimited",
      advancedFraud: planKey !== "free",
    },
    limits: {
      orderLimit: Number.isFinite(plan.orderLimit) ? plan.orderLimit : null,
    },
  };
}
