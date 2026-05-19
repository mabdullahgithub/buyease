"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import {
  CashDollarFilledIcon,
  ChartVerticalIcon,
  ChatIcon,
  CheckCircleIcon,
  DataTableIcon,
  OrderIcon,
  PersonIcon,
} from "@shopify/polaris-icons";
import type { IconSource } from "@shopify/polaris";

import { PLANS, type PlanKey } from "@/lib/billing";
import HomePageSkeleton from "@/components/skeletons/HomePageSkeleton";

type CurrentPlanResponse = {
  plan: string;
  hasActiveSubscription: boolean;
  interval: string;
};

type FeatureCardDef = {
  title: string;
  description: string;
  href: string;
  icon: IconSource;
  iconTone: "info" | "success" | "magic" | "caution" | "base" | "critical";
  comingSoon?: boolean;
};

const FEATURE_CARDS: FeatureCardDef[] = [
  {
    title: "Form Builder",
    description:
      "Design your COD order form with drag & drop. Customize fields, layouts, and your buy button.",
    href: "/form-builder",
    icon: DataTableIcon,
    iconTone: "info",
  },
  {
    title: "Sales Booster",
    description:
      "Add quantity offers, upsells, and conversion tools to increase your average order value.",
    href: "/sales-booster",
    icon: CashDollarFilledIcon,
    iconTone: "success",
  },
  {
    title: "Integrations",
    description:
      "Connect WhatsApp, SMS, Google Sheets, and ad pixels. Keep customers and data in sync.",
    href: "/integrations",
    icon: ChatIcon,
    iconTone: "magic",
  },
  {
    title: "Analytics",
    description:
      "Track orders, conversions, and form performance with detailed insights and reports.",
    href: "/analytics",
    icon: ChartVerticalIcon,
    iconTone: "caution",
    comingSoon: true,
  },
  {
    title: "Settings",
    description:
      "Configure COD fees, tax rates, fraud prevention, and abandoned cart recovery.",
    href: "/settings",
    icon: PersonIcon,
    iconTone: "base",
  },
  {
    title: "Billing",
    description:
      "Manage your subscription. Upgrade to unlock more orders and premium features.",
    href: "/billing",
    icon: OrderIcon,
    iconTone: "critical",
  },
];

const PLAN_BADGE_TONE: Record<PlanKey, "success" | "info" | "attention" | "magic"> = {
  free: "info",
  premium: "success",
  enterprise: "attention",
  unlimited: "magic",
};

const STAT_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(200px, 1fr))",
} as const;

const FEATURE_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(280px, 1fr))",
} as const;

const ICON_BOX_STYLE: CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--p-color-bg-surface-secondary)",
  flexShrink: 0,
};

const FEATURE_CARD_STYLE: CSSProperties = {
  background: "var(--p-color-bg-surface)",
  border: "1px solid var(--p-color-border)",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  height: "100%",
  boxSizing: "border-box",
};

export function HomePageContent(): ReactElement {
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan(): Promise<void> {
      try {
        const res = await fetch("/api/billing/current");
        if (res.ok) {
          const data = (await res.json()) as CurrentPlanResponse;
          setPlan(data.plan as PlanKey);
          setHasActiveSubscription(data.hasActiveSubscription);
        }
      } catch {
        setPlan("free");
      } finally {
        setLoading(false);
      }
    }
    void fetchPlan();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  const currentPlan = plan ?? "free";
  const planDef = PLANS[currentPlan];
  const isUnlimited = currentPlan === "unlimited";
  const orderLimit = Number.isFinite(planDef.orderLimit)
    ? planDef.orderLimit.toLocaleString()
    : "Unlimited";

  return (
    <Page fullWidth>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">

          {/* Welcome Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <BlockStack gap="200">
                <Text as="p" variant="bodySm">
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>BuyEase Merchant Dashboard</span>
                </Text>
                <Text as="h1" variant="headingXl" fontWeight="bold">
                  <span style={{ color: "#ffffff" }}>Welcome back!</span>
                </Text>
                <Text as="p" variant="bodyMd">
                  <span style={{ color: "rgba(255,255,255,0.65)" }}>
                    Your COD store is live and ready to take orders.
                  </span>
                </Text>
                {!isUnlimited && (
                  <Box paddingBlockStart="150">
                    <Button url="/billing" size="slim" variant="primary">
                      Upgrade Plan
                    </Button>
                  </Box>
                )}
              </BlockStack>

              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  flexShrink: 0,
                }}
              >
                <BlockStack gap="100">
                  <Text as="p" variant="bodyXs">
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Current plan</span>
                  </Text>
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    <span style={{ color: "#ffffff" }}>{planDef.name}</span>
                  </Text>
                  <Text as="p" variant="bodyXs">
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>
                      {planDef.monthlyAmount === 0
                        ? "Free forever"
                        : `$${planDef.monthlyAmount}/mo`}
                    </span>
                  </Text>
                </BlockStack>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <InlineGrid columns={STAT_GRID_COLUMNS} gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Current Plan
                  </Text>
                  <Badge tone={PLAN_BADGE_TONE[currentPlan]}>{planDef.name}</Badge>
                </InlineStack>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  {planDef.monthlyAmount === 0 ? "Free" : `$${planDef.monthlyAmount}/mo`}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {hasActiveSubscription ? "Active subscription" : "Free plan active"}
                </Text>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Monthly Order Limit
                </Text>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  {orderLimit}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  orders per billing period
                </Text>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Need assistance?
                </Text>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  Support
                </Text>
                <Button variant="plain" url="mailto:support@buyease.app" external>
                  Contact our team →
                </Button>
              </BlockStack>
            </Card>
          </InlineGrid>

          {/* App Features */}
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg" fontWeight="semibold">
              App Features
            </Text>
            <InlineGrid columns={FEATURE_GRID_COLUMNS} gap="400">
              {FEATURE_CARDS.map((feature) => (
                <div key={feature.href} style={FEATURE_CARD_STYLE}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={ICON_BOX_STYLE}>
                      <Icon source={feature.icon} tone={feature.iconTone} />
                    </div>
                    {feature.comingSoon && <Badge tone="info">Coming Soon</Badge>}
                  </div>

                  <BlockStack gap="100">
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {feature.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {feature.description}
                    </Text>
                  </BlockStack>

                  <div style={{ marginTop: "auto" }}>
                    <Button
                      url={feature.comingSoon ? undefined : feature.href}
                      disabled={feature.comingSoon}
                      size="slim"
                    >
                      {feature.comingSoon ? "Coming Soon" : `Open ${feature.title}`}
                    </Button>
                  </div>
                </div>
              ))}
            </InlineGrid>
          </BlockStack>

          {/* Quick Start Guide */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Quick Start Guide
              </Text>
              <BlockStack gap="300">
                {[
                  { label: "Install BuyEase on your store", done: true, href: undefined },
                  { label: "Customize your COD order form", done: false, href: "/form-builder" },
                  { label: "Set up integrations & messaging", done: false, href: "/integrations" },
                  { label: "Configure fees & fraud prevention", done: false, href: "/settings" },
                  {
                    label: "Upgrade for more orders & features",
                    done: isUnlimited,
                    href: isUnlimited ? undefined : "/billing",
                  },
                ].map((step, idx) => (
                  <InlineStack key={idx} gap="300" blockAlign="center">
                    <Box minWidth="20px">
                      <Icon
                        source={CheckCircleIcon}
                        tone={step.done ? "success" : "subdued"}
                      />
                    </Box>
                    {step.href !== undefined ? (
                      <Button variant="plain" url={step.href}>
                        {step.label}
                      </Button>
                    ) : (
                      <Text as="span" variant="bodyMd" tone={step.done ? "subdued" : undefined}>
                        {step.label}
                      </Text>
                    )}
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>

        </BlockStack>
      </div>
    </Page>
  );
}
