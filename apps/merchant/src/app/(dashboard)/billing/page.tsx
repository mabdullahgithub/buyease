"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Page,
  SkeletonBodyText,
  Text,
  TextField,
} from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";

import {
  PLANS,
  getEffectiveMonthlyPrice,
  getAnnualTotal,
  type PlanKey,
  type BillingInterval,
} from "@/lib/billing";

const PLAN_KEYS: PlanKey[] = ["free", "premium", "enterprise", "unlimited"];

export default function BillingPage(): ReactElement {
  const [interval, setInterval] = useState<BillingInterval>("EVERY_30_DAYS");
  const [currentPlan, setCurrentPlan] = useState<PlanKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<PlanKey | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    async function fetchCurrentPlan(): Promise<void> {
      try {
        const res = await fetch("/api/billing/current");
        if (res.ok) {
          const data = (await res.json()) as { plan: string };
          setCurrentPlan(data.plan as PlanKey);
        }
      } catch {
        setCurrentPlan("free");
      } finally {
        setLoading(false);
      }
    }

    void fetchCurrentPlan();
  }, []);

  const handleSelectPlan = useCallback(
    async (planKey: PlanKey) => {
      if (planKey === "free") return;

      setSubscribing(planKey);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const host = urlParams.get("host") ?? "";

        const res = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey, interval, host }),
        });

        if (!res.ok) {
          const error = (await res.json()) as { error: string };
          throw new Error(error.error);
        }

        const data = (await res.json()) as { confirmationUrl: string };

        if (data.confirmationUrl) {
          window.top
            ? (window.top.location.href = data.confirmationUrl)
            : (window.location.href = data.confirmationUrl);
        }
      } catch (error) {
        console.error("Plan selection failed", error);
      } finally {
        setSubscribing(null);
      }
    },
    [interval],
  );

  const handleApplyDiscount = useCallback(() => {
    if (!discountCode.trim()) return;
    setDiscountApplied(true);
  }, [discountCode]);

  const isAnnual = interval === "ANNUAL";

  return (
    <Page
      title="Billing Plans"
      subtitle="Change your plan here. If you need help or you have any doubts or questions don't hesitate to contact us!"
    >
      <BlockStack gap="600">
        {/* Monthly / Annual toggle */}
        <InlineStack align="center" gap="200">
          <ButtonGroup variant="segmented">
            <Button
              pressed={!isAnnual}
              onClick={() => setInterval("EVERY_30_DAYS")}
            >
              Monthly
            </Button>
            <Button
              pressed={isAnnual}
              onClick={() => setInterval("ANNUAL")}
            >
              Annual
            </Button>
          </ButtonGroup>
          {isAnnual && <Badge tone="success">-30%</Badge>}
        </InlineStack>

        {/* Discount code */}
        <InlineStack align="center" gap="200" blockAlign="end">
          <Box width="240px">
            <TextField
              label=""
              labelHidden
              placeholder="Enter discount code"
              value={discountCode}
              onChange={setDiscountCode}
              autoComplete="off"
              connectedRight={
                <Button onClick={handleApplyDiscount}>Apply</Button>
              }
            />
          </Box>
        </InlineStack>

        {discountApplied && (
          <Banner tone="info" onDismiss={() => setDiscountApplied(false)}>
            Discount codes are applied at Shopify checkout when confirming your
            subscription.
          </Banner>
        )}

        {/* Plan cards */}
        {loading ? (
          <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
            {PLAN_KEYS.map((key) => (
              <Card key={key}>
                <SkeletonBodyText lines={10} />
              </Card>
            ))}
          </InlineGrid>
        ) : (
          <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
            {PLAN_KEYS.map((planKey) => {
              const plan = PLANS[planKey];
              const isCurrent = currentPlan === planKey;
              const monthlyPrice = getEffectiveMonthlyPrice(plan, interval);
              const annualTotal = getAnnualTotal(plan);
              const isSubscribing = subscribing === planKey;

              return (
                <Card key={planKey} roundedAbove="sm">
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      {isCurrent && (
                        <Box>
                          <Badge tone="info">YOUR CURRENT PLAN</Badge>
                        </Box>
                      )}

                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {plan.name}
                      </Text>

                      {plan.monthlyAmount === 0 ? (
                        <Text as="p" variant="headingXl" fontWeight="bold">
                          Free
                        </Text>
                      ) : (
                        <BlockStack gap="100">
                          <InlineStack gap="100" blockAlign="baseline">
                            <Text as="span" variant="heading2xl" fontWeight="bold">
                              ${monthlyPrice.toFixed(2)}
                            </Text>
                            <Text as="span" variant="bodyMd" tone="subdued">
                              / month
                            </Text>
                          </InlineStack>
                          {isAnnual && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              billed at ${annualTotal.toFixed(2)} once per year
                            </Text>
                          )}
                        </BlockStack>
                      )}
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="200">
                      {plan.features.map((feature) => (
                        <InlineStack
                          key={feature}
                          gap="200"
                          blockAlign="start"
                          wrap={false}
                        >
                          <Box minWidth="20px">
                            <Icon source={CheckCircleIcon} tone="success" />
                          </Box>
                          <Text as="span" variant="bodyMd">
                            {feature}
                          </Text>
                        </InlineStack>
                      ))}
                    </BlockStack>

                    <Box paddingBlockStart="200">
                      {isCurrent ? (
                        <Button fullWidth disabled>
                          Current plan
                        </Button>
                      ) : planKey === "free" ? (
                        currentPlan !== "free" ? (
                          <Button
                            fullWidth
                            onClick={() => void handleSelectPlan(planKey)}
                          >
                            Downgrade to Free
                          </Button>
                        ) : null
                      ) : (
                        <Button
                          variant="primary"
                          fullWidth
                          loading={isSubscribing}
                          onClick={() => void handleSelectPlan(planKey)}
                        >
                          Select plan
                        </Button>
                      )}
                    </Box>
                  </BlockStack>
                </Card>
              );
            })}
          </InlineGrid>
        )}

        {/* Footer disclaimer — wrapped in Card to match reference design */}
        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              All charges are handled securely via Shopify Billing. If you choose
              a paid plan, you&apos;ll be redirected to confirm the charge.{" "}
              <Text as="span" variant="bodyMd" fontWeight="bold">
                Switching plans won&apos;t reset your order count—orders already
                used this month will count toward your new plan&apos;s limit.
              </Text>
            </Text>
            <Text as="p" variant="bodyMd">
              You can cancel your subscription at any time by changing to the free
              plan or by uninstalling this app.
            </Text>
            <Text as="p" variant="bodyMd">
              For more details about our refund policy, please visit our{" "}
              <Button variant="plain" url="https://buyease.dev/refund-policy" external>
                Refund Policy
              </Button>
              .
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
