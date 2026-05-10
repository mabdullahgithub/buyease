"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  SkeletonThumbnail,
} from "@shopify/polaris";

function SkeletonCheckbox({ lines = 1 }: { lines?: number }): ReactElement {
  return (
    <BlockStack gap="100">
      {Array.from({ length: lines }, (_, i) => (
        <InlineStack key={i} gap="200" blockAlign="center" wrap={false}>
          <Box minWidth="18px">
            <SkeletonThumbnail size="extraSmall" />
          </Box>
          <Box width="100%">
            <SkeletonBodyText lines={1} />
          </Box>
        </InlineStack>
      ))}
    </BlockStack>
  );
}

function SectionLeft({
  titleWidth,
  descLines,
}: {
  titleWidth: `${number}ch` | `${number}%`;
  descLines: number;
}): ReactElement {
  return (
    <BlockStack gap="200">
      <SkeletonDisplayText size="small" maxWidth={titleWidth} />
      <SkeletonBodyText lines={descLines} />
    </BlockStack>
  );
}

export default function SettingsPageSkeleton(): ReactElement {
  return (
    <SkeletonPage title="Settings & Integrations">
      <BlockStack gap="400">
        {/* ── Tab bar ─────────────────────────────────────────────────── */}
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={5} gap="100">
            {(["10ch", "7ch", "6ch", "11ch", "18ch"] as Array<`${number}ch`>).map(
              (w, i) => (
                <Box
                  key={i}
                  paddingBlock="200"
                  paddingInline="300"
                  minHeight="32px"
                >
                  <InlineStack blockAlign="center" align="center">
                    <SkeletonDisplayText size="small" maxWidth={w} />
                  </InlineStack>
                </Box>
              ),
            )}
          </InlineGrid>
        </Box>

        {/* ── Section 1: BuyEase Activation ───────────────────────────── */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <SectionLeft titleWidth="8ch" descLines={1} />

          <BlockStack gap="400">
            <Card padding="0">
              {/* Activation instructions */}
              <Box padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <SkeletonDisplayText size="small" maxWidth="20ch" />
                    <SkeletonDisplayText size="small" maxWidth="8ch" />
                  </InlineStack>

                  <InlineStack gap="300" blockAlign="center" wrap={false}>
                    <Box width="100%">
                      <SkeletonBodyText lines={1} />
                    </Box>
                    <Box minWidth="100px">
                      <SkeletonDisplayText size="small" maxWidth="100%" />
                    </Box>
                  </InlineStack>

                  <SkeletonBodyText lines={1} />

                  {/* Image area */}
                  <Box
                    background="bg-surface-secondary"
                    borderRadius="200"
                    borderWidth="025"
                    borderColor="border"
                    minHeight="180px"
                  />
                </BlockStack>
              </Box>

              <Divider />

              {/* Contact row */}
              <Box padding="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Box maxWidth="34ch">
                    <SkeletonBodyText lines={1} />
                  </Box>
                  <Box minWidth="110px">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                  </Box>
                </InlineStack>
              </Box>
            </Card>

            {/* Banner */}
            <Box
              background="bg-surface-info"
              borderRadius="200"
              padding="400"
            >
              <BlockStack gap="200">
                <SkeletonBodyText lines={1} />
                <InlineStack gap="200">
                  <Box minWidth="22ch">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                  </Box>
                  <Box minWidth="10ch">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                  </Box>
                </InlineStack>
              </BlockStack>
            </Box>
          </BlockStack>
        </InlineGrid>

        <Divider />

        {/* ── Section 2: Form Placement ────────────────────────────────── */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <SectionLeft titleWidth="12ch" descLines={3} />

          <Card padding="0">
            {/* Segmented tab selector */}
            <Box padding="400">
              <Box
                background="bg-surface-secondary"
                borderRadius="200"
                borderWidth="025"
                borderColor="border"
                paddingBlock="050"
                paddingInline="050"
              >
                <InlineGrid columns={3} gap="100">
                  {(["10ch", "14ch", "11ch"] as Array<`${number}ch`>).map((w, i) => (
                    <Box key={i} paddingBlock="200" paddingInline="300">
                      <InlineStack align="center">
                        <SkeletonDisplayText size="small" maxWidth={w} />
                      </InlineStack>
                    </Box>
                  ))}
                </InlineGrid>
              </Box>
            </Box>

            {/* Info strip */}
            <Box
              background="bg-surface-info"
              paddingBlock="300"
              paddingInline="400"
            >
              <InlineStack gap="200" blockAlign="center">
                <Box minWidth="18px">
                  <SkeletonThumbnail size="extraSmall" />
                </Box>
                <Box width="100%">
                  <SkeletonBodyText lines={1} />
                </Box>
              </InlineStack>
            </Box>

            <Divider />

            {/* Hide-button checkboxes + when-opened radios */}
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonCheckbox lines={3} />

                <InlineStack gap="400" blockAlign="start" wrap={false}>
                  <Box minWidth="fit-content">
                    <SkeletonBodyText lines={1} />
                  </Box>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <Box minWidth="18px">
                        <SkeletonThumbnail size="extraSmall" />
                      </Box>
                      <Box width="100%">
                        <SkeletonBodyText lines={1} />
                      </Box>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <Box minWidth="18px">
                        <SkeletonThumbnail size="extraSmall" />
                      </Box>
                      <Box width="100%">
                        <SkeletonBodyText lines={1} />
                      </Box>
                    </InlineStack>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Box>

            <Divider />

            {/* Disable-in row */}
            <Box padding="400">
              <InlineStack gap="300" blockAlign="center" wrap>
                <Box minWidth="10ch">
                  <SkeletonBodyText lines={1} />
                </Box>
                {Array.from({ length: 5 }, (_, i) => (
                  <InlineStack key={i} gap="150" blockAlign="center" wrap={false}>
                    <Box minWidth="18px">
                      <SkeletonThumbnail size="extraSmall" />
                    </Box>
                    <Box minWidth="9ch">
                      <SkeletonBodyText lines={1} />
                    </Box>
                  </InlineStack>
                ))}
              </InlineStack>
            </Box>
          </Card>
        </InlineGrid>

        <Divider />

        {/* ── Section 3: Restrict ──────────────────────────────────────── */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <SectionLeft titleWidth="20ch" descLines={3} />

          <Card padding="0">
            {/* Products & collections */}
            <Box padding="400">
              <SkeletonCheckbox lines={2} />
            </Box>

            <Divider />

            {/* Countries */}
            <Box padding="400">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <Box minWidth="18px">
                    <SkeletonThumbnail size="extraSmall" />
                  </Box>
                  <Box width="100%">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </InlineStack>
                <Box paddingInlineStart="600">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>
            </Box>

            <Divider />

            {/* Order eligibility */}
            <Box padding="400">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <Box minWidth="18px">
                    <SkeletonThumbnail size="extraSmall" />
                  </Box>
                  <Box width="100%">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </InlineStack>
                <Box paddingInlineStart="600">
                  <SkeletonBodyText lines={2} />
                </Box>
              </BlockStack>
            </Box>
          </Card>
        </InlineGrid>
      </BlockStack>
    </SkeletonPage>
  );
}
