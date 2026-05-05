"use client";

import type { CSSProperties, ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  SkeletonThumbnail,
} from "@shopify/polaris";

import { PLANS, type PlanKey } from "@/lib/billing";

const PLAN_KEYS: PlanKey[] = ["free", "premium", "enterprise", "unlimited"];

const BILLING_PLAN_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(268px, 1fr))",
} as const;

const PLAN_CARD_SHELL: CSSProperties = {
  borderRadius: "12px",
  border: "1px solid var(--p-color-border)",
  background: "var(--p-color-bg-surface)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
};

const PLAN_CARD_INNER: CSSProperties = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

/**
 * Full-width route-level loading skeleton for the Billing page.
 * Mirrors: heading, interval toggle, 4-plan card grid, FAQ card.
 */
export default function BillingPageSkeleton(): ReactElement {
  return (
    <SkeletonPage fullWidth title="Billing Plans">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">
          {/* Subtitle */}
          <Box maxWidth="60ch">
            <SkeletonBodyText lines={2} />
          </Box>

          {/* Interval toggle */}
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

          {/* Plan cards grid */}
          <InlineGrid columns={BILLING_PLAN_GRID_COLUMNS} gap="500">
            {PLAN_KEYS.map((planKey) => {
              const featureCount = PLANS[planKey].features.length;
              return (
                <div key={planKey} style={PLAN_CARD_SHELL}>
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

          {/* FAQ card */}
          <Card roundedAbove="sm">
            <BlockStack gap="200">
              <SkeletonBodyText lines={3} />
              <SkeletonBodyText lines={2} />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
    </SkeletonPage>
  );
}
