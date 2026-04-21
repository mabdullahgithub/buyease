"use client";

import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Text,
  type IconSource,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatIcon,
  QuestionCircleIcon,
  EmailIcon,
  ChartVerticalIcon,
  OrderIcon,
  CashDollarIcon,
} from "@shopify/polaris-icons";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";

export type HomeClientProps = {
  shop: string;
  ordersLast7Days: number;
  revenueLast7Days: number;
  conversionRateLast7Days: string;
  ordersThisMonth: number;
  totalOrders: number;
  planName: string;
  planOrderLimit: number;
};

const CHANGELOG: Array<{
  version: string;
  date: string;
  badge: string;
  tone: "success" | "info" | "attention";
  title: string;
  bullets: string[];
}> = [
  {
    version: "v1.0",
    date: "Apr 22, 2026",
    badge: "Latest",
    tone: "success",
    title: "BuyEase is live — COD made world-class",
    bullets: [
      "Full COD form builder — multi-design system, fully customizable",
      "Quantity offers to boost average order value",
      "Smart upsell & downsell flows at the right moment",
      "Real-time analytics: orders, revenue, conversion rate",
    ],
  },
];

type SetupStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: { label: string; href: string; external?: boolean };
};

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: IconSource;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Box
            background="bg-fill-info-secondary"
            borderRadius="200"
            padding="150"
          >
            <Icon source={icon} tone="info" />
          </Box>
          <Text as="p" variant="bodySm" tone="subdued">
            {label}
          </Text>
        </InlineStack>
        <Text as="p" variant="headingXl" fontWeight="bold">
          {value}
        </Text>
        {sub ? (
          <Text as="p" variant="bodySm" tone="subdued">
            {sub}
          </Text>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function StepRow({ step }: { step: SetupStep }) {
  return (
    <Box paddingBlockEnd="0">
      <InlineStack gap="400" align="start" blockAlign="start">
        <Box>
          {step.completed ? (
            <Icon source={CheckCircleIcon} tone="success" />
          ) : (
            <Icon source={MinusCircleIcon} tone="subdued" />
          )}
        </Box>
        <BlockStack gap="100">
          <Text
            as="span"
            variant="bodyMd"
            fontWeight={step.completed ? "regular" : "semibold"}
            tone={step.completed ? "subdued" : undefined}
          >
            {step.title}
          </Text>
          {!step.completed && step.description ? (
            <Text as="p" variant="bodySm" tone="subdued">
              {step.description}
            </Text>
          ) : null}
          {!step.completed && step.action ? (
            <Box paddingBlockStart="200">
              <Button
                size="slim"
                variant="secondary"
                url={step.action.href}
                target={step.action.external ? "_blank" : undefined}
              >
                {step.action.label}
              </Button>
            </Box>
          ) : null}
        </BlockStack>
      </InlineStack>
    </Box>
  );
}

function SupportCard({
  icon,
  title,
  description,
  actionLabel,
  actionUrl,
}: {
  icon: IconSource;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Box
          background="bg-fill-info-secondary"
          borderRadius="200"
          padding="200"
          width="fit-content"
        >
          <Icon source={icon} tone="info" />
        </Box>
        <BlockStack gap="100">
          <Text as="h3" variant="headingSm">
            {title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {description}
          </Text>
        </BlockStack>
        <Button
          variant="secondary"
          size="slim"
          url={actionUrl}
          target="_blank"
        >
          {actionLabel}
        </Button>
      </BlockStack>
    </Card>
  );
}

function HomeClientInner({
  shop,
  ordersLast7Days,
  revenueLast7Days,
  conversionRateLast7Days,
  ordersThisMonth,
  totalOrders,
  planName,
  planOrderLimit,
}: HomeClientProps) {
  const searchParams = useSearchParams();
  const withEmbed = (path: string) => appendEmbeddedAppQuery(path, searchParams);

  const [setupOpen, setSetupOpen] = useState(true);
  const [changelogOpen, setChangelogOpen] = useState(true);

  const steps: SetupStep[] = [
    {
      id: "installed",
      title: "BuyEase installed successfully",
      description: "",
      completed: true,
    },
    {
      id: "theme-embed",
      title: "Enable app embed in your Shopify theme",
      description:
        "Open your theme editor and activate the BuyEase embed so the COD form appears on your store.",
      completed: false,
      action: {
        label: "Open theme editor",
        href: `https://${shop}/admin/themes/current/editor?context=apps`,
        external: true,
      },
    },
    {
      id: "configure-form",
      title: "Configure your COD form",
      description:
        "Customize the form title, fields, design, and CTA to match your brand.",
      completed: false,
      action: {
        label: "Configure form",
        href: withEmbed("/form-builder/editor"),
      },
    },
    {
      id: "first-order",
      title: "Receive your first COD order",
      description:
        "Once your form is live, new orders placed through it will appear in your analytics.",
      completed: totalOrders > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const setupProgress = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  const usagePct =
    planOrderLimit > 0
      ? Math.min(100, Math.round((ordersThisMonth / planOrderLimit) * 100))
      : 0;

  const usageTone: "success" | "highlight" | "critical" =
    usagePct >= 90 ? "critical" : usagePct >= 70 ? "highlight" : "success";

  return (
    <Page title="BuyEase COD Form" subtitle="Overview — COD forms, upsells, and setup">
      <Layout>
        {/* ── Analytics – Last 7 days ─────────────────────────────── */}
        <Layout.Section>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Analytics — Last 7 days
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
              <StatCard
                icon={OrderIcon}
                label="Total orders"
                value={ordersLast7Days.toLocaleString()}
                sub={ordersLast7Days === 0 ? "No data available yet" : undefined}
              />
              <StatCard
                icon={CashDollarIcon}
                label="COD revenue"
                value={`$${revenueLast7Days.toFixed(2)}`}
                sub={revenueLast7Days === 0 ? "No data available yet" : undefined}
              />
              <StatCard
                icon={ChartVerticalIcon}
                label="Conversion rate"
                value={`${conversionRateLast7Days}%`}
                sub="Confirmed ÷ total"
              />
            </InlineGrid>
          </BlockStack>
        </Layout.Section>

        {/* ── Setup Guide + What's New ─────────────────────────────── */}
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
            {/* Setup Guide */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      {allDone ? "You are all set" : "Welcome to BuyEase COD Form"}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {allDone
                        ? "Your COD form is live and ready."
                        : `${completedCount} of ${steps.length} tasks completed`}
                    </Text>
                  </BlockStack>
                  <Button
                    variant="plain"
                    icon={setupOpen ? ChevronUpIcon : ChevronDownIcon}
                    onClick={() => setSetupOpen((v) => !v)}
                    accessibilityLabel={setupOpen ? "Collapse setup guide" : "Expand setup guide"}
                  />
                </InlineStack>

                <ProgressBar
                  progress={setupProgress}
                  tone={allDone ? "success" : "highlight"}
                  size="small"
                />

                <Collapsible
                  id="setup-guide"
                  open={setupOpen}
                  transition={{ duration: "200ms", timingFunction: "ease" }}
                >
                  <BlockStack gap="0">
                    {steps.map((step, i) => (
                      <Box key={step.id} paddingBlockEnd={i < steps.length - 1 ? "400" : "0"}>
                        {i > 0 && (
                          <Box paddingBlockEnd="400">
                            <Divider />
                          </Box>
                        )}
                        <StepRow step={step} />
                      </Box>
                    ))}
                  </BlockStack>
                </Collapsible>
              </BlockStack>
            </Card>

            {/* What's New */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    What&apos;s New
                  </Text>
                  <Button
                    variant="plain"
                    icon={changelogOpen ? ChevronUpIcon : ChevronDownIcon}
                    onClick={() => setChangelogOpen((v) => !v)}
                    accessibilityLabel={changelogOpen ? "Collapse changelog" : "Expand changelog"}
                  />
                </InlineStack>

                <Collapsible
                  id="changelog"
                  open={changelogOpen}
                  transition={{ duration: "200ms", timingFunction: "ease" }}
                >
                  <BlockStack gap="500">
                    {CHANGELOG.map((entry) => (
                      <BlockStack key={entry.version} gap="300">
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone={entry.tone}>{entry.badge}</Badge>
                          <Text as="span" variant="bodySm" tone="subdued">
                            {entry.date}
                          </Text>
                        </InlineStack>
                        <Text as="h3" variant="headingSm">
                          {entry.title}
                        </Text>
                        <BlockStack gap="100">
                          {entry.bullets.map((b, bi) => (
                            <InlineStack key={`${entry.version}-${bi}`} gap="200" blockAlign="start">
                              <Text as="span" variant="bodySm" tone="subdued">
                                •
                              </Text>
                              <Text as="span" variant="bodySm">
                                {b}
                              </Text>
                            </InlineStack>
                          ))}
                        </BlockStack>
                      </BlockStack>
                    ))}
                  </BlockStack>
                </Collapsible>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* ── Plan usage ──────────────────────────────────────────── */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Your plan
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {`Orders usage on your ${planName} plan`}
                  </Text>
                </BlockStack>
                <Button
                  variant="secondary"
                  size="slim"
                  url={withEmbed("/plan")}
                >
                  {planName === "Free" ? "Upgrade plan" : "Manage plan"}
                </Button>
              </InlineStack>

              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodySm">
                    {ordersThisMonth.toLocaleString()} /{" "}
                    {planOrderLimit < 0 ? "Unlimited" : planOrderLimit.toLocaleString()} orders this month
                  </Text>
                  <Text as="p" variant="bodySm" tone={usageTone === "critical" ? "critical" : "subdued"}>
                    {planOrderLimit < 0 ? "Unlimited" : `${usagePct}%`}
                  </Text>
                </InlineStack>

                {planOrderLimit > 0 && (
                  <ProgressBar progress={usagePct} tone={usageTone} size="small" />
                )}
              </BlockStack>

              {usagePct >= 80 && planOrderLimit > 0 && (
                <Text as="p" variant="bodySm" tone="critical">
                  You&apos;ve used {usagePct}% of your monthly order limit. Upgrade to avoid
                  interruptions when you reach 100%.
                </Text>
              )}

              <Divider />

              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  • Once you reach the limit, new orders are held and only created in Shopify after you upgrade.
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  • The order limit resets on the first day of each month, or you can upgrade to a higher plan.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* ── Support ──────────────────────────────────────────────── */}
        <Layout.Section>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Need help?
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
              <SupportCard
                icon={ChatIcon}
                title="Contact support"
                description="Reach the BuyEase team for setup help, billing, or technical questions."
                actionLabel="Contact support"
                actionUrl="mailto:support@buyease.app"
              />
              <SupportCard
                icon={EmailIcon}
                title="Email us"
                description="Prefer email? Send details about your store and we will respond within one business day."
                actionLabel="Send email"
                actionUrl="mailto:support@buyease.app"
              />
              <SupportCard
                icon={QuestionCircleIcon}
                title="Help center"
                description="Browse guides, tutorials, and answers to common questions."
                actionLabel="Open help center"
                actionUrl="https://buyease.app/help"
              />
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function HomeClient(props: HomeClientProps) {
  return (
    <Suspense fallback={null}>
      <HomeClientInner {...props} />
    </Suspense>
  );
}
