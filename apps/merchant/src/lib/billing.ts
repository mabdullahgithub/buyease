/** Annual billing discount factor — 30% off monthly price. */
const ANNUAL_DISCOUNT = 0.30;

export type PlanKey = "free" | "premium" | "enterprise" | "unlimited";
export type BillingInterval = "EVERY_30_DAYS" | "ANNUAL";

export type PlanDefinition = {
  name: string;
  monthlyAmount: number;
  currencyCode: string;
  trialDays: number;
  orderLimit: number;
  features: string[];
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  free: {
    name: "Free",
    monthlyAmount: 0,
    currencyCode: "USD",
    trialDays: 0,
    orderLimit: 60,
    features: [
      "60 Orders/Month",
      "Original Form Design",
      "Basic Fraud Prevention",
      "Address Validation & Cart Recovery",
      "Conversion Boosters & SMS Notifications",
      "Insights & Analytics Dashboard",
      "Google Sheets & Ad Pixel",
      "New Form Design (Drag & Drop)",
      "Basic Form Shape Templates",
      "24/7 Email support (exclude custom code assistance)",
    ],
  },
  premium: {
    name: "Premium",
    monthlyAmount: 9.99,
    currencyCode: "USD",
    trialDays: 0,
    orderLimit: 420,
    features: [
      "ALL Free Plan Features",
      "420 Orders/Month",
      "Quantity Offers on Product Page",
      "Advanced Fraud Prevention",
      "Personalized Coverages",
      "Special Form Fields Customization",
      "Advanced Form Templates",
      "24/7 Live Chat Support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyAmount: 16.99,
    currencyCode: "USD",
    trialDays: 0,
    orderLimit: 10000,
    features: [
      "ALL Premium Plan Features",
      "10,000 Orders/Month",
      "Custom Code Assistance",
      "24/7 Live Chat Support (< 5 min response)",
    ],
  },
  unlimited: {
    name: "Unlimited",
    monthlyAmount: 59.99,
    currencyCode: "USD",
    trialDays: 0,
    orderLimit: Infinity,
    features: [
      "ALL Enterprise Plan Features",
      "Unlimited Orders/Month",
      "A/B Testing for one click upsell",
      "Multiple Form Versions",
      "Custom Code Assistance",
      "24/7 Live Chat Support (< 2 min response)",
    ],
  },
} as const;

/**
 * Returns the effective monthly price for a given interval.
 * Annual: 30% discount applied, then divided by 12 for display.
 */
export function getEffectiveMonthlyPrice(plan: PlanDefinition, interval: BillingInterval): number {
  if (plan.monthlyAmount === 0) return 0;
  if (interval === "ANNUAL") {
    const annualTotal = plan.monthlyAmount * 12 * (1 - ANNUAL_DISCOUNT);
    return Math.round((annualTotal / 12) * 100) / 100;
  }
  return plan.monthlyAmount;
}

/**
 * Returns the total annual price (for the "billed at $X once per year" display).
 */
export function getAnnualTotal(plan: PlanDefinition): number {
  if (plan.monthlyAmount === 0) return 0;
  return Math.round(plan.monthlyAmount * 12 * (1 - ANNUAL_DISCOUNT) * 100) / 100;
}

/**
 * Returns the Shopify Billing API price for a given interval.
 * Monthly: raw monthly amount. Annual: total annual amount.
 */
export function getBillingPrice(plan: PlanDefinition, interval: BillingInterval): number {
  if (interval === "ANNUAL") {
    return getAnnualTotal(plan);
  }
  return plan.monthlyAmount;
}

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
    price: plan.monthlyAmount,
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
