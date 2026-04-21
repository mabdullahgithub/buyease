export type BillingPlanId = "free" | "premium" | "enterprise" | "unlimited";

export type BillingPlanDefinition = {
  readonly id: BillingPlanId;
  readonly name: string;
  readonly isCurrent: boolean;
  /** null = free plan */
  readonly monthlyPriceUsd: number | null;
  /** Shopify-style annual charge (charged once per year) */
  readonly annualTotalUsd: number | null;
  readonly features: readonly string[];
};

export const BILLING_PLANS: readonly BillingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    isCurrent: true,
    monthlyPriceUsd: null,
    annualTotalUsd: null,
    features: [
      "60 orders / month",
      "COD form — classic layouts",
      "Basic fraud signals",
      "Address validation & cart recovery",
      "Conversion boosters & SMS hooks",
      "Analytics overview",
      "Google Sheets export & ad pixels",
      "Drag & drop form builder",
      "Starter form templates",
      "24/7 email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    isCurrent: false,
    monthlyPriceUsd: 9.99,
    annualTotalUsd: 89.99,
    features: [
      "Everything in Free",
      "420 orders / month",
      "Quantity offers on product pages",
      "Advanced fraud prevention",
      "Personalized coverage rules",
      "Custom fields & validation",
      "Advanced form templates",
      "24/7 live chat support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    isCurrent: false,
    monthlyPriceUsd: 29.99,
    annualTotalUsd: 269.99,
    features: [
      "Everything in Premium",
      "10,000 orders / month",
      "Custom code assistance",
      "24/7 live chat — under 5 min response",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    isCurrent: false,
    monthlyPriceUsd: 69.99,
    annualTotalUsd: 629.99,
    features: [
      "Everything in Enterprise",
      "Unlimited orders / month",
      "A/B testing for one-click upsells",
      "Multiple published form versions",
      "Dedicated implementation support",
      "24/7 live chat — under 2 min response",
    ],
  },
] as const;
