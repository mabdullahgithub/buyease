"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

const PLAN_PLACEHOLDERS = [0, 1, 2, 3] as const;

/**
 * Mirrors the billing page: hero, interval toggle, plan grid, policy card.
 * Shared by route `loading.tsx` and client fetch state for zero layout shift.
 */
export function BillingPlansPageSkeleton(): ReactElement {
  return (
    <Page fullWidth>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">
          <BlockStack gap="100">
            <Box maxWidth="22ch">
              <SkeletonDisplayText maxWidth="100%" size="large" />
            </Box>
            <Box maxWidth="min(56ch, 100%)">
              <SkeletonBodyText lines={2} />
            </Box>
          </BlockStack>

          <InlineStack align="center" gap="200">
            <Box
              background="bg-surface-secondary"
              padding="100"
              borderRadius="200"
              borderWidth="025"
              borderColor="border"
            >
              <InlineStack gap="0">
                <Box paddingInline="300" paddingBlock="150" minWidth="88px">
                  <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingInline="300" paddingBlock="150" minWidth="88px">
                  <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
              </InlineStack>
            </Box>
            <Box minWidth="52px">
              <SkeletonDisplayText size="small" />
            </Box>
          </InlineStack>

          <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="500">
            {PLAN_PLACEHOLDERS.map((i) => (
              <Card key={i} roundedAbove="sm">
                <BlockStack gap="400">
                  <SkeletonDisplayText size="small" />
                  <Box maxWidth="12ch">
                    <SkeletonDisplayText size="medium" />
                  </Box>
                  <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
                    <BlockStack gap="200">
                      <SkeletonBodyText lines={5} />
                    </BlockStack>
                  </Box>
                  <Box paddingBlockStart="100">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                  </Box>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>

          <Card roundedAbove="sm">
            <BlockStack gap="300">
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
    </Page>
  );
}
