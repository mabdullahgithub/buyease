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
  SkeletonThumbnail,
} from "@shopify/polaris";

/**
 * Full-width loading skeleton for the Form Builder page.
 * Uses Page (not SkeletonPage) to match the actual page width exactly.
 * Mirrors the Buy Button Designer workspace (default view) - two-column layout
 * with form controls (twoThirds) + sticky preview sidebar (oneThird).
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
                <InlineStack gap="100" blockAlign="center" wrap={false}>
                  <SkeletonThumbnail size="extraSmall" />
                  <Box minWidth="0" width="100%">
                    <SkeletonDisplayText size="small" maxWidth="10ch" />
                  </Box>
                </InlineStack>
              </Box>
            ))}
          </InlineGrid>
        </Box>

        {/* Workspace grid: main content (twoThirds) + preview sidebar (oneThird) */}
        <InlineGrid
          columns={{ xs: 1, md: ["twoThirds", "oneThird"] }}
          gap="400"
          alignItems="start"
        >
          {/* Main workspace card - form controls */}
          <Card roundedAbove="sm">
            <BlockStack gap="500">
              {/* Visibility checkbox */}
              <InlineStack gap="300" blockAlign="center">
                <Box minWidth="16px">
                  <SkeletonThumbnail size="extraSmall" />
                </Box>
                <SkeletonDisplayText size="small" maxWidth="26ch" />
              </InlineStack>

              {/* Button text and subtitle fields (2-column) */}
              <InlineGrid columns={2} gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="10ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="14ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </InlineGrid>

              {/* Text size, style, icon row (3-column) */}
              <InlineGrid columns={3} gap="300">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="8ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="6ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                  >
                    <InlineGrid columns={2} gap="0">
                      <Box
                        paddingBlock="200"
                        paddingInline="300"
                        borderInlineEndWidth="025"
                        borderColor="border"
                      >
                        <SkeletonDisplayText size="small" maxWidth="2ch" />
                      </Box>
                      <Box paddingBlock="200" paddingInline="300">
                        <SkeletonDisplayText size="small" maxWidth="2ch" />
                      </Box>
                    </InlineGrid>
                  </Box>
                </BlockStack>
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="10ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <InlineStack gap="100" blockAlign="center" wrap={false}>
                      <SkeletonThumbnail size="extraSmall" />
                      <Box minWidth="0" width="100%">
                        <SkeletonBodyText lines={1} />
                      </Box>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </InlineGrid>

              {/* Animation and sticky position dropdowns (2-column) */}
              <InlineGrid columns={2} gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="10ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="18ch" />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </InlineGrid>

              {/* Color pickers (2-column: Background + Text) */}
              <InlineGrid columns={2} gap="400">
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="16ch" />
                  <Box
                    background="bg-surface-secondary"
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    minHeight="200px"
                  />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="10ch" />
                  <Box
                    background="bg-surface-secondary"
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    minHeight="200px"
                  />
                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    paddingBlock="200"
                    paddingInline="300"
                  >
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </InlineGrid>

              {/* Border color picker (full-width) */}
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <Box
                  background="bg-surface-secondary"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  minHeight="200px"
                />
                <Box
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  paddingBlock="200"
                  paddingInline="300"
                >
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>

              {/* Border radius & width sliders (2-column) */}
              <InlineGrid columns={2} gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="13ch" />
                  <Box paddingBlock="200">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="12ch" />
                  <Box paddingBlock="200">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </InlineGrid>

              {/* Shadow slider */}
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" maxWidth="8ch" />
                <Box paddingBlock="200">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>

              {/* Width slider with help text */}
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <Box maxWidth="45ch">
                  <SkeletonBodyText lines={1} />
                </Box>
                <Box paddingBlock="200">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>

              {/* Mobile checkboxes */}
              <InlineStack gap="300" blockAlign="center">
                <Box minWidth="16px">
                  <SkeletonThumbnail size="extraSmall" />
                </Box>
                <Box minWidth="0" width="100%">
                  <SkeletonBodyText lines={1} />
                </Box>
              </InlineStack>

              <InlineStack gap="300" blockAlign="start">
                <Box minWidth="16px">
                  <SkeletonThumbnail size="extraSmall" />
                </Box>
                <BlockStack gap="100">
                  <SkeletonBodyText lines={1} />
                  <Box maxWidth="42ch">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </InlineStack>

              {/* Contact banner at bottom */}
              <Card roundedAbove="sm" background="bg-surface-secondary">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center" wrap={false}>
                    <SkeletonThumbnail size="small" />
                    <Box minWidth="0" width="100%">
                      <SkeletonDisplayText size="small" maxWidth="22ch" />
                    </Box>
                  </InlineStack>
                  <SkeletonBodyText lines={2} />
                </BlockStack>
              </Card>
            </BlockStack>
          </Card>

          {/* Live preview sidebar (oneThird, sticky) */}
          <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
            <BlockStack gap="300">
              {/* Preview heading */}
              <InlineStack align="center">
                <Box
                  borderBlockEndWidth="025"
                  borderColor="border-secondary"
                  paddingBlockEnd="100"
                >
                  <SkeletonDisplayText size="small" maxWidth="12ch" />
                </Box>
              </InlineStack>

              {/* Preview card with button mockup */}
              <Card roundedAbove="sm">
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="300"
                  borderWidth="025"
                  borderColor="border"
                  minHeight="160px"
                >
                  <BlockStack gap="300" inlineAlign="center">
                    <Box
                      background="bg-surface"
                      borderRadius="200"
                      paddingBlock="300"
                      paddingInline="500"
                      width="85%"
                      minHeight="48px"
                    >
                      <InlineStack gap="200" blockAlign="center" align="center">
                        <SkeletonThumbnail size="small" />
                        <Box minWidth="0" width="60%">
                          <SkeletonBodyText lines={1} />
                        </Box>
                      </InlineStack>
                    </Box>
                  </BlockStack>
                </Box>
              </Card>

              {/* Reset button */}
              <InlineStack align="center">
                <Box
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  paddingBlock="150"
                  paddingInline="400"
                >
                  <SkeletonDisplayText size="small" maxWidth="16ch" />
                </Box>
              </InlineStack>

              {/* Caption */}
              <InlineStack align="center">
                <Box maxWidth="30ch">
                  <SkeletonBodyText lines={1} />
                </Box>
              </InlineStack>
            </BlockStack>
          </Box>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
