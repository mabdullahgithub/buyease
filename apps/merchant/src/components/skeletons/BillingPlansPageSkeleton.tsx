"use client";

import type { ReactElement } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonThumbnail,
} from "@shopify/polaris";

const PLAN_COUNT = 4;

/** Matches longest plan feature list (Free) so placeholder height tracks real cards. */
const FEATURE_ROW_WIDTHS = ["94%", "88%", "96%", "82%", "91%", "86%", "93%", "79%", "90%", "85%"] as const;

function PlanCardFeatureRows(): ReactElement {
  return (
    <BlockStack gap="200">
      {FEATURE_ROW_WIDTHS.map((width, index) => (
        <InlineStack key={index} gap="200" blockAlign="start" wrap={false}>
          <Box>
            <SkeletonThumbnail size="extraSmall" />
          </Box>
          <Box minWidth="0" width={width}>
            <SkeletonBodyText lines={1} />
          </Box>
        </InlineStack>
      ))}
    </BlockStack>
  );
}

function PlanCardSkeleton(): ReactElement {
  return (
    <Box
      borderRadius="300"
      borderWidth="025"
      borderColor="border"
      background="bg-surface"
      padding="500"
    >
      <BlockStack gap="400">
        <BlockStack gap="200">
          <SkeletonDisplayText maxWidth="12ch" size="small" />

          <BlockStack gap="050">
            <InlineStack gap="100" blockAlign="baseline" wrap={false}>
              <Box maxWidth="10ch">
                <SkeletonDisplayText size="large" maxWidth="100%" />
              </Box>
              <Box maxWidth="5ch" paddingBlockStart="100">
                <SkeletonDisplayText size="small" maxWidth="100%" />
              </Box>
            </InlineStack>
            <Box maxWidth="28ch">
              <SkeletonBodyText lines={1} />
            </Box>
          </BlockStack>
        </BlockStack>

        <Divider />

        <PlanCardFeatureRows />

        <Box paddingBlockStart="500">
          <Box
            background="bg-fill-tertiary"
            borderRadius="200"
            minHeight="36px"
            width="100%"
          />
        </Box>
      </BlockStack>
    </Box>
  );
}

/**
 * Mirrors `(dashboard)/billing/page.tsx`: hero, segmented billing toggle + badge,
 * four bordered plan columns (heading → price → divider → check rows → CTA), policy card.
 */
export function BillingPlansPageSkeleton(): ReactElement {
  return (
    <Page fullWidth>
      <BlockStack gap="600" inlineAlign="center">
        <Box maxWidth="1200px" width="100%">
          <BlockStack gap="600">
            <BlockStack gap="300">
              <Box maxWidth="24ch">
                <SkeletonDisplayText maxWidth="100%" size="large" />
              </Box>
              <Box maxWidth="62ch">
                <SkeletonBodyText lines={2} />
              </Box>
            </BlockStack>

            <InlineStack align="center" gap="300" blockAlign="center">
              <Box
                background="bg-surface-secondary"
                padding="100"
                borderRadius="200"
                borderWidth="025"
                borderColor="border"
              >
                <InlineStack gap="100">
                  <Box
                    background="bg-surface"
                    paddingInline="400"
                    paddingBlock="300"
                    borderRadius="100"
                    borderWidth="025"
                    borderColor="border"
                    minWidth="112px"
                  >
                    <SkeletonDisplayText size="small" maxWidth="9ch" />
                  </Box>
                  <Box paddingInline="400" paddingBlock="300" minWidth="112px">
                    <SkeletonDisplayText size="small" maxWidth="8ch" />
                  </Box>
                </InlineStack>
              </Box>
              <Badge tone="success">-30%</Badge>
            </InlineStack>

            <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="500">
              {Array.from({ length: PLAN_COUNT }).map((_, index) => (
                <PlanCardSkeleton key={index} />
              ))}
            </InlineGrid>

            <Card roundedAbove="sm">
              <BlockStack gap="500">
                <SkeletonBodyText lines={3} />
                <SkeletonBodyText lines={2} />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Card>
          </BlockStack>
        </Box>
      </BlockStack>
    </Page>
  );
}
