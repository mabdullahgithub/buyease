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

/**
 * Full-width loading skeleton for the Form Builder page.
 * Uses Page (not SkeletonPage) to match the actual page width exactly.
 */
export default function FormBuilderPageSkeleton(): ReactElement {
  return (
    <Page title="Form Builder">
      <BlockStack gap="400">
        {/* Mode selector bar — 4 columns matching actual page */}
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={4} gap="100">
            {Array.from({ length: 4 }, (_, i) => (
              <Box
                key={i}
                paddingBlock="200"
                paddingInline="400"
                borderRadius="200"
                background={i === 0 ? "bg-surface" : "bg-surface-secondary"}
              >
                <SkeletonDisplayText size="small" maxWidth="10ch" />
              </Box>
            ))}
          </InlineGrid>
        </Box>

        {/* Workspace grid: main content + preview sidebar */}
        <InlineGrid
          columns={{ xs: 1, md: ["twoThirds", "oneThird"] }}
          gap="400"
          alignItems="start"
        >
          {/* Main workspace card */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" maxWidth="20ch" />
              <SkeletonBodyText lines={4} />
              <Box paddingBlockStart="200">
                <SkeletonBodyText lines={4} />
              </Box>
              <Box paddingBlockStart="200">
                <SkeletonBodyText lines={3} />
              </Box>
            </BlockStack>
          </Card>

          {/* Live preview sidebar card */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <Box maxWidth="28ch">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>
              <Box
                background="bg-surface-secondary"
                borderWidth="025"
                borderColor="border"
                borderRadius="300"
                padding="400"
                minHeight="320px"
              >
                <BlockStack gap="300">
                  <SkeletonBodyText lines={6} />
                  <Box maxWidth="16ch">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
