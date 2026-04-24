"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  Page,
  SkeletonBodyText,
  Text,
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

  const handleSelectPlan = useCallback(async (planKey: PlanKey) => {
    if (planKey === "free") return;

    setSubscribing(planKey);
    try {
      // Extract the Shopify host param from the current URL for callback redirect
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
  }, [interval]);

  const isAnnual = interval === "ANNUAL";

  return (
    <Page title="Billing Plans">
      <BlockStack gap="600">
        <Text as="p" variant="bodyMd" tone="subdued">
          Change your plan here. If you need help or you have any doubts or questions don&apos;t
          hesitate to contact us!
        </Text>

        {/* Monthly / Annual toggle — using Polaris ButtonGroup */}
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
              Annual -30%
            </Button>
          </ButtonGroup>
        </InlineStack>

        {/* Plan cards — responsive 4-column grid */}
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
                <Card key={planKey}>
                  <BlockStack gap="400">
                    {/* Current plan badge */}
                    {isCurrent && (
                      <Box>
                        <Badge tone="info">YOUR CURRENT PLAN</Badge>
                      </Box>
                    )}

                    {/* Plan name */}
                    <Text as="h2" variant="headingLg">
                      {plan.name}
                    </Text>

                    {/* Price */}
                    {plan.monthlyAmount === 0 ? (
                      <Text as="p" variant="headingXl">
                        Free
                      </Text>
                    ) : (
                      <BlockStack gap="100">
                        <InlineStack gap="100" blockAlign="baseline">
                          <Text as="span" variant="headingXl">
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

                    <Divider />

                    {/* Features list */}
                    <BlockStack gap="200">
                      {plan.features.map((feature) => (
                        <InlineStack key={feature} gap="200" blockAlign="start" wrap={false}>
                          <Box minWidth="20px">
                            <Icon source={CheckCircleIcon} tone="success" />
                          </Box>
                          <Text as="span" variant="bodyMd">
                            {feature}
                          </Text>
                        </InlineStack>
                      ))}
                    </BlockStack>

                    {/* Select button */}
                    {!isCurrent && planKey !== "free" && (
                      <Box paddingBlockStart="200">
                        <Button
                          variant="primary"
                          fullWidth
                          loading={isSubscribing}
                          onClick={() => void handleSelectPlan(planKey)}
                        >
                          Select plan
                        </Button>
                      </Box>
                    )}

                    {isCurrent && planKey !== "free" && (
                      <Box paddingBlockStart="200">
                        <Button fullWidth disabled>
                          Current plan
                        </Button>
                      </Box>
                    )}
                  </BlockStack>
                </Card>
              );
            })}
          </InlineGrid>
        )}

        {/* Footer disclaimer */}
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              All charges are handled securely via Shopify Billing. If you choose a paid plan, you&apos;ll
              be redirected to confirm the charge.{" "}
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                Switching plans won&apos;t reset your order count—orders already used this month will
                count toward your new plan&apos;s limit.
              </Text>
            </Text>
            <Text as="p" variant="bodyMd">
              You can cancel your subscription at any time by changing to the free plan or by
              uninstalling this app.
            </Text>
            <Text as="p" variant="bodyMd">
              For more details about our refund policy, please visit our{" "}
              <Link url="https://buyease.dev/refund-policy" external>
                Refund Policy
              </Link>
              .
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
