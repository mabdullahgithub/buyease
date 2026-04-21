"use client";

import { CheckCircleIcon } from "@shopify/polaris-icons";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Icon,
  InlineGrid,
  InlineStack,
  Layout,
  Link,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";
import { BILLING_PLANS, type BillingPlanDefinition } from "./plan-catalog";

type BillingCycle = "monthly" | "annual";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function annualSavingsPercent(
  monthly: number | null,
  annualTotal: number | null,
): number | null {
  if (monthly == null || annualTotal == null) return null;
  const full = monthly * 12;
  if (full <= 0) return null;
  return Math.max(0, Math.round((1 - annualTotal / full) * 100));
}

function PlanPricing({
  plan,
  cycle,
}: {
  plan: BillingPlanDefinition;
  cycle: BillingCycle;
}): React.JSX.Element {
  if (plan.monthlyPriceUsd == null) {
    return (
      <BlockStack gap="100">
        <Text as="p" variant="heading2xl" fontWeight="bold">
          Free
        </Text>
        {cycle === "annual" ? (
          <Text as="p" variant="bodySm" tone="subdued">
            Annual billing does not apply to the Free plan.
          </Text>
        ) : null}
      </BlockStack>
    );
  }

  const monthly = plan.monthlyPriceUsd;
  const annualTotal = plan.annualTotalUsd;
  const monthlyLine =
    cycle === "monthly"
      ? `${money.format(monthly)} / month`
      : annualTotal != null
        ? `${money.format(annualTotal / 12)} / month`
        : `${money.format(monthly)} / month`;

  return (
    <BlockStack gap="100">
      <Text as="p" variant="heading2xl" fontWeight="bold">
        {monthlyLine}
      </Text>
      {cycle === "annual" && annualTotal != null ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {`Billed at ${money.format(annualTotal)} once per year`}
        </Text>
      ) : (
        <Text as="p" variant="bodySm" tone="subdued">
          Billed every 30 days through Shopify
        </Text>
      )}
    </BlockStack>
  );
}

function PlanCard({
  plan,
  cycle,
}: {
  plan: BillingPlanDefinition;
  cycle: BillingCycle;
}): React.JSX.Element {
  const isCurrent = plan.isCurrent;

  return (
    <Box
      borderWidth={isCurrent ? "100" : "025"}
      borderColor={isCurrent ? "border-emphasis" : "border"}
      borderRadius="300"
      shadow={isCurrent ? "300" : "100"}
      minHeight="100%"
    >
      <Card roundedAbove="sm">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="start" wrap={false}>
            <Text as="h2" variant="headingLg" fontWeight="bold">
              {plan.name}
            </Text>
            {isCurrent ? (
              <Box
                background="bg-fill-inverse"
                paddingInline="200"
                paddingBlock="100"
                borderRadius="200"
              >
                <Text
                  as="span"
                  variant="headingSm"
                  fontWeight="bold"
                  tone="text-inverse"
                >
                  Your current plan
                </Text>
              </Box>
            ) : null}
          </InlineStack>

          <PlanPricing plan={plan} cycle={cycle} />

          <BlockStack as="ul" gap="200">
            {plan.features.map((line) => (
              <Box as="li" key={line}>
                <InlineStack gap="200" wrap={false} blockAlign="start">
                  <Box minWidth="20px" paddingBlockStart="050">
                    <Icon source={CheckCircleIcon} />
                  </Box>
                  <Text as="span" variant="bodyMd">
                    {line}
                  </Text>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>

          {isCurrent ? null : (
            <Box paddingBlockStart="200">
              <Button variant="primary" fullWidth>
                Select plan
              </Button>
            </Box>
          )}
        </BlockStack>
      </Card>
    </Box>
  );
}

export function BillingPlansClient(): React.JSX.Element {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [discountCode, setDiscountCode] = useState("");
  const [discountBanner, setDiscountBanner] = useState<{
    tone: "success" | "critical" | "info";
    message: string;
  } | null>(null);

  const headlineSavings = useMemo(() => {
    const sample = BILLING_PLANS.find((p) => p.monthlyPriceUsd != null);
    if (!sample?.monthlyPriceUsd || !sample.annualTotalUsd) return null;
    return annualSavingsPercent(sample.monthlyPriceUsd, sample.annualTotalUsd);
  }, []);

  const dismissDiscountBanner = useCallback(() => {
    setDiscountBanner(null);
  }, []);

  const onApplyDiscount = useCallback(() => {
    const trimmed = discountCode.trim();
    if (!trimmed) {
      setDiscountBanner({
        tone: "critical",
        message: "Enter a discount code before applying.",
      });
      return;
    }
    setDiscountBanner({
      tone: "info",
      message:
        "Promotional codes are not applied on this screen yet. When billing goes live, valid codes will be confirmed through Shopify before checkout.",
    });
  }, [discountCode]);

  return (
    <Page
      fullWidth
      title="Billing Plans"
      subtitle="Change your plan here. If you need help or you have any doubts or questions don't hesitate to contact us!"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {discountBanner ? (
              <Banner tone={discountBanner.tone} onDismiss={dismissDiscountBanner}>
                {discountBanner.message}
              </Banner>
            ) : null}

            <Box
              background="bg-surface-secondary"
              padding="500"
              borderRadius="300"
            >
              <BlockStack gap="400" inlineAlign="center">
                <InlineStack gap="300" wrap blockAlign="center" align="center">
                  <ButtonGroup variant="segmented">
                    <Button
                      pressed={cycle === "monthly"}
                      onClick={() => setCycle("monthly")}
                    >
                      Monthly
                    </Button>
                    <Button
                      pressed={cycle === "annual"}
                      onClick={() => setCycle("annual")}
                    >
                      Annual
                    </Button>
                  </ButtonGroup>
                  {headlineSavings != null && headlineSavings > 0 ? (
                    <Badge tone="success">{`−${headlineSavings}%`}</Badge>
                  ) : null}
                </InlineStack>

                <InlineStack
                  gap="300"
                  wrap
                  blockAlign="end"
                  align="center"
                >
                  <Box minWidth="220px" maxWidth="360px" width="100%">
                    <TextField
                      label="Discount code"
                      labelHidden
                      value={discountCode}
                      onChange={setDiscountCode}
                      placeholder="Enter discount code"
                      autoComplete="off"
                    />
                  </Box>
                  <Button onClick={onApplyDiscount}>Apply</Button>
                </InlineStack>
              </BlockStack>
            </Box>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              {BILLING_PLANS.map((plan) => (
                <Box key={plan.id} minHeight="100%">
                  <PlanCard plan={plan} cycle={cycle} />
                </Box>
              ))}
            </InlineGrid>

            <Box
              background="bg-surface-secondary"
              padding="500"
              borderRadius="300"
            >
              <BlockStack gap="300">
                <Text as="p" variant="bodySm" tone="subdued">
                  Charges appear on your Shopify invoice and are processed by
                  Shopify Billing. BuyEase never stores your payment card.
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  You can change plans at any time. Upgrades take effect
                  immediately; downgrades follow your current billing period
                  unless Shopify shows a different effective date at approval
                  time.
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Questions about charges?{" "}
                  <Link url="mailto:support@buyease.app">Contact support</Link>
                  {" · "}
                  <Link url="https://buyease.app/legal/refund-policy">
                    Refund policy
                  </Link>
                </Text>
              </BlockStack>
            </Box>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
