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
  SkeletonTabs,
  SkeletonThumbnail,
} from "@shopify/polaris";

/**
 * Matches `FormBuilderPageContent` + `BuyButtonDesignerWorkspace`: subtitle, segmented modes,
 * instruction card, two-column editor + preview (Polaris-only layout primitives).
 */
export function FormBuilderPageSkeleton(): ReactElement {
  return (
    <Page title="Form Builder">
      <BlockStack gap="500">
        <Box maxWidth="52ch">
          <SkeletonBodyText lines={2} />
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
          <SkeletonTabs count={3} fitted />
        </Box>

        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <SkeletonBodyText lines={3} />
          </BlockStack>
        </Card>

        <InlineGrid
          columns={{
            xs: 1,
            md: ["twoThirds", "oneThird"],
          }}
          gap="500"
          alignItems="start"
        >
          <Card roundedAbove="sm">
            <BlockStack gap="600">
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" maxWidth="14ch" />
                <SkeletonBodyText lines={1} />
              </BlockStack>

              <InlineGrid columns={{ xs: 1, sm: 3 }} gap="500">
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="10ch" />
                  <SkeletonBodyText lines={2} />
                </BlockStack>
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="8ch" />
                  <Box
                    background="bg-fill-tertiary"
                    borderRadius="200"
                    minHeight="36px"
                    width="100%"
                  />
                </BlockStack>
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="12ch" />
                  <Box
                    background="bg-fill-tertiary"
                    borderRadius="200"
                    minHeight="36px"
                    width="100%"
                  />
                </BlockStack>
              </InlineGrid>

              <BlockStack gap="300">
                <SkeletonDisplayText size="small" maxWidth="16ch" />
                <Box paddingBlockStart="200">
                  <InlineGrid columns={{ xs: 2, sm: 4 }} gap="300">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Box key={j} minWidth="0">
                        <SkeletonThumbnail size="medium" />
                      </Box>
                    ))}
                  </InlineGrid>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>

          <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
            <Card roundedAbove="sm">
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="20ch" />
                  <SkeletonBodyText lines={2} />
                </BlockStack>
                <Box
                  background="bg-surface-secondary"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="300"
                  padding="500"
                  minHeight="320px"
                >
                  <BlockStack gap="400" inlineAlign="center">
                    <Box width="100%" maxWidth="32ch" minHeight="120px">
                      <SkeletonDisplayText size="large" maxWidth="100%" />
                    </Box>
                    <Box width="100%" maxWidth="22ch">
                      <SkeletonBodyText lines={2} />
                    </Box>
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
