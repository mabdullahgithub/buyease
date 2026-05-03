"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

const TAB_COUNT = 3;

/**
 * Matches Form Builder: page chrome, segmented modes, two-column editor + preview (buy-button layout).
 */
export function FormBuilderPageSkeleton(): ReactElement {
  return (
    <Page title="Form Builder">
      <BlockStack gap="400">
        <Box maxWidth="min(48ch, 100%)">
          <SkeletonBodyText lines={1} />
        </Box>
        <Box
          padding="100"
          background="bg-surface"
          borderWidth="025"
          borderColor="border"
          borderRadius="300"
          shadow="100"
          width="100%"
        >
          <InlineGrid columns={{ xs: 1, sm: TAB_COUNT }} gap="200">
            {Array.from({ length: TAB_COUNT }, (_, i) => (
              <Box key={i} padding="200" minHeight="36px">
                <SkeletonDisplayText size="small" maxWidth="100%" />
              </Box>
            ))}
          </InlineGrid>
        </Box>

        <InlineGrid
          columns={{
            xs: 1,
            md: ["twoThirds", "oneThird"],
          }}
          gap="400"
          alignItems="start"
        >
          <Card roundedAbove="sm">
            <BlockStack gap="500">
              <SkeletonBodyText lines={2} />
              <BlockStack gap="300">
                <SkeletonDisplayText size="small" maxWidth="15ch" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
              <BlockStack gap="300">
                <SkeletonDisplayText size="small" maxWidth="18ch" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
              <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                <SkeletonBodyText lines={3} />
                <SkeletonBodyText lines={4} />
                <SkeletonBodyText lines={4} />
              </InlineGrid>
              <Box paddingBlockStart="200">
                <SkeletonBodyText lines={8} />
              </Box>
            </BlockStack>
          </Card>

          <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="20ch" />
                  <SkeletonBodyText lines={2} />
                </BlockStack>
                <Box
                  background="bg-surface-secondary"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="300"
                  padding="400"
                  minHeight="320px"
                >
                  <BlockStack gap="300" inlineAlign="center">
                    <Box width="100%" maxWidth="30ch">
                      <SkeletonDisplayText size="medium" maxWidth="100%" />
                    </Box>
                    <SkeletonBodyText lines={6} />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Box>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
