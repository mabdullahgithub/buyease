"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
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
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonThumbnail,
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

/**
 * Polaris numeric columns compile to repeat(N, minmax(0, 1fr)), which collapses tracks in
 * the embedded admin iframe and congests plan cards/skeletons. Auto-fill preserves a sane
 * card width so layout matches readable pricing columns.
 */
const BILLING_PLAN_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(268px, 1fr))",
} as const;

const LANDING_SITE_URL = "https://buyease-landing.vercel.app/";

type CurrentPlanResponse = {
  plan: string;
  hasActiveSubscription: boolean;
  interval: string;
};

const BILLING_PAGE_SUBTITLE =
  "Change your plan here. If you need help or you have any doubts or questions don't hesitate to contact us!";

const BILLING_PLAN_CARD_SHELL: CSSProperties = {
  borderRadius: "12px",
  border: "1px solid var(--p-color-border)",
  background: "var(--p-color-bg-surface)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  position: "relative",
};

const PLAN_CARD_INNER: CSSProperties = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

function BillingPageSkeleton(): ReactElement {
  return (
    <Page fullWidth>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">
          <BlockStack gap="100">
            <SkeletonDisplayText size="large" maxWidth="18ch" />
            <SkeletonBodyText lines={2} />
          </BlockStack>

          <InlineStack align="center" gap="200" wrap>
            <Box
              borderWidth="025"
              borderColor="border"
              borderRadius="200"
              overflowX="hidden"
              overflowY="hidden"
            >
              <InlineStack gap="0" wrap={false}>
                <Box paddingInline="400" paddingBlock="200" minWidth="88px">
                  <SkeletonDisplayText size="small" maxWidth="7ch" />
                </Box>
                <Box
                  paddingInline="400"
                  paddingBlock="200"
                  minWidth="88px"
                  borderInlineStartWidth="025"
                  borderColor="border"
                >
                  <SkeletonDisplayText size="small" maxWidth="7ch" />
                </Box>
              </InlineStack>
            </Box>
            <Box minWidth="52px">
              <SkeletonDisplayText size="small" maxWidth="6ch" />
            </Box>
          </InlineStack>

          <InlineGrid columns={BILLING_PLAN_GRID_COLUMNS} gap="500">
            {PLAN_KEYS.map((planKey) => {
              const featureCount = PLANS[planKey].features.length;
              return (
                <div key={planKey} style={BILLING_PLAN_CARD_SHELL}>
                  <div style={PLAN_CARD_INNER}>
                    <BlockStack gap="150">
                      <SkeletonDisplayText size="small" maxWidth="15ch" />
                      <BlockStack gap="050">
                        <SkeletonDisplayText size="medium" maxWidth="14ch" />
                        <Box maxWidth="9ch">
                          <SkeletonDisplayText size="small" maxWidth="100%" />
                        </Box>
                        <Box maxWidth="28ch" paddingBlockStart="100">
                          <SkeletonBodyText lines={1} />
                        </Box>
                      </BlockStack>
                    </BlockStack>

                    <div
                      style={{
                        borderTop: "1px solid var(--p-color-border)",
                        flex: 1,
                        marginTop: "16px",
                        minHeight: 0,
                        paddingTop: "16px",
                      }}
                    >
                      <BlockStack gap="150">
                        {Array.from({ length: featureCount }, (_, idx) => (
                          <InlineStack key={idx} gap="150" blockAlign="start" wrap={false}>
                            <Box minWidth="18px">
                              <SkeletonThumbnail size="extraSmall" />
                            </Box>
                            <Box minWidth="0" width="100%">
                              <SkeletonBodyText lines={1} />
                            </Box>
                          </InlineStack>
                        ))}
                      </BlockStack>
                    </div>

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "16px",
                        width: "100%",
                      }}
                    >
                      <SkeletonDisplayText maxWidth="100%" size="small" />
                    </div>
                  </div>
                </div>
              );
            })}
          </InlineGrid>

          <Card roundedAbove="sm">
            <BlockStack gap="200">
              <SkeletonBodyText lines={3} />
              <SkeletonBodyText lines={2} />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
    </Page>
  );
}

export default function BillingPage(): ReactElement {
  const [interval, setInterval] = useState<BillingInterval>("EVERY_30_DAYS");
  const [currentPlan, setCurrentPlan] = useState<PlanKey | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<PlanKey | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentPlan(): Promise<void> {
      try {
        const res = await fetch("/api/billing/current");
        if (res.ok) {
          const data = (await res.json()) as CurrentPlanResponse;
          setCurrentPlan(data.plan as PlanKey);
          setHasActiveSubscription(data.hasActiveSubscription);
          if (data.interval === "ANNUAL") {
            setInterval("ANNUAL");
          } else {
            setInterval("EVERY_30_DAYS");
          }
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
      if (planKey === currentPlan) return;
      setError(null);
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
          const errData = (await res.json()) as { error: string };
          throw new Error(errData.error);
        }

        const data = (await res.json()) as { confirmationUrl: string };
        if (data.confirmationUrl) {
          if (window.top) {
            window.top.location.href = data.confirmationUrl;
          } else {
            window.location.href = data.confirmationUrl;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to select plan. Please try again.");
      } finally {
        setSubscribing(null);
      }
    },
    [interval, currentPlan],
  );

  const handleCancelSubscription = useCallback(async () => {
    setError(null);
    setCancelling(true);

    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const errData = (await res.json()) as { error: string };
        throw new Error(errData.error);
      }

      setCurrentPlan("free");
      setHasActiveSubscription(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  }, []);

  const isAnnual = interval === "ANNUAL";

  if (loading) {
    return <BillingPageSkeleton />;
  }

  return (
    <Page fullWidth>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <BlockStack gap="600">
        <BlockStack gap="100">
          <Text as="h1" variant="headingXl">
            Billing Plans
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            {BILLING_PAGE_SUBTITLE}
          </Text>
        </BlockStack>

        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <InlineStack align="center" gap="200">
          <ButtonGroup variant="segmented">
            <Button pressed={!isAnnual} onClick={() => setInterval("EVERY_30_DAYS")}>
              Monthly
            </Button>
            <Button pressed={isAnnual} onClick={() => setInterval("ANNUAL")}>
              Annual
            </Button>
          </ButtonGroup>
          {isAnnual && <Badge tone="success">-30%</Badge>}
        </InlineStack>

        <InlineGrid columns={BILLING_PLAN_GRID_COLUMNS} gap="500">
          {PLAN_KEYS.map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = currentPlan === planKey;
            const monthlyPrice = getEffectiveMonthlyPrice(plan, interval);
            const annualTotal = getAnnualTotal(plan);
            const isSubscribing = subscribing === planKey;
            const isFree = plan.monthlyAmount === 0;

            return (
              <div
                key={planKey}
                style={{
                  background: "var(--p-color-bg-surface)",
                  border: isCurrent ? "2.5px solid #1a1a1a" : "1px solid var(--p-color-border)",
                  borderRadius: "12px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 0,
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1,
                      background: "#1a1a1a",
                      color: "#fff",
                      padding: "3px 9px",
                      borderRadius: "5px",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.42px",
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    YOUR CURRENT PLAN
                  </div>
                )}

                <div style={PLAN_CARD_INNER}>
                  <BlockStack gap="150">
                    <Text as="h3" variant="headingXs" fontWeight="bold">
                      {plan.name}
                    </Text>

                    {isFree ? (
                      <Text as="p" variant="headingXl" fontWeight="bold">
                        Free
                      </Text>
                    ) : (
                      <BlockStack gap="050">
                        <InlineStack gap="100" blockAlign="baseline">
                          <Text as="span" variant="headingXl" fontWeight="bold">
                            ${monthlyPrice.toFixed(2)}
                          </Text>
                          <Text as="span" variant="bodyXs" tone="subdued">
                            / month
                          </Text>
                        </InlineStack>
                        {isAnnual && (
                          <Text as="p" variant="bodyXs" tone="subdued">
                            billed at ${annualTotal.toFixed(2)} once per year
                          </Text>
                        )}
                      </BlockStack>
                    )}
                  </BlockStack>

                  <div
                    style={{
                      borderTop: "1px solid var(--p-color-border)",
                      flex: 1,
                      marginTop: "16px",
                      minHeight: 0,
                      paddingTop: "16px",
                    }}
                  >
                    <BlockStack gap="150">
                      {plan.features.map((feature) => {
                        const boldMatch = feature.match(/^(\d[\d,]*)\s/);
                        const unlimitedMatch = feature.toLowerCase().startsWith("unlimited");
                        const allMatch = feature.startsWith("ALL ");

                        return (
                          <InlineStack key={feature} gap="150" blockAlign="start" wrap={false}>
                            <Box minWidth="18px">
                              <Icon source={CheckCircleIcon} tone="success" />
                            </Box>
                            <Text as="span" variant="bodySm" breakWord>
                              {boldMatch ? (
                                <>
                                  <Text as="span" variant="bodySm" fontWeight="bold">
                                    {boldMatch[1]}
                                  </Text>
                                  {feature.slice(boldMatch[1]!.length)}
                                </>
                              ) : unlimitedMatch ? (
                                <>
                                  <Text as="span" variant="bodySm" fontWeight="bold">
                                    Unlimited
                                  </Text>
                                  {feature.slice(9)}
                                </>
                              ) : allMatch ? (
                                <>
                                  <Text as="span" variant="bodySm" fontWeight="bold">
                                    ALL
                                  </Text>
                                  {feature.slice(3)}
                                </>
                              ) : (
                                feature
                              )}
                            </Text>
                          </InlineStack>
                        );
                      })}
                    </BlockStack>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "16px",
                      width: "100%",
                    }}
                  >
                    {isCurrent ? (
                      <Button disabled fullWidth size="slim" variant="primary">
                        Current plan
                      </Button>
                    ) : planKey === "free" && hasActiveSubscription ? (
                      <Button
                        fullWidth
                        loading={cancelling}
                        size="slim"
                        variant="primary"
                        onClick={() => void handleCancelSubscription()}
                      >
                        Select plan
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        loading={isSubscribing}
                        size="slim"
                        variant="primary"
                        onClick={() => void handleSelectPlan(planKey)}
                      >
                        Select plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </InlineGrid>

        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              All charges are handled securely via Shopify Billing. If you choose a paid plan,
              you&apos;ll be redirected to confirm the charge.{" "}
              <Text as="span" variant="bodyMd" fontWeight="bold">
                Switching plans won&apos;t reset your order count—orders already used this month
                will count toward your new plan&apos;s limit.
              </Text>
            </Text>
            <Text as="p" variant="bodyMd">
              You can cancel your subscription at any time by changing to the free plan or by
              uninstalling this app.
            </Text>
            <Text as="p" variant="bodyMd">
              For more details about our refund policy, please visit our{" "}
              <Button
                variant="plain"
                url={LANDING_SITE_URL}
                external
                target="_blank"
              >
                Refund Policy
              </Button>
              .
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
      </div>
    </Page>
  );
}
