"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

/**
 * Loading skeleton for Form Builder — uses SkeletonPage (animated title) and
 * inline-style placeholder boxes matching the integrations page pattern.
 * Shows during route load; workspace internal skeleton is suppressed to avoid
 * the double-skeleton flash.
 */
export default function FormBuilderPageSkeleton(): ReactElement {
  return (
    <SkeletonPage title="Form Builder">
      <BlockStack gap="400">
        {/* Mode selector — 4 equal-width pill buttons */}
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={4} gap="100">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 36,
                  backgroundColor:
                    i === 0
                      ? "var(--p-color-bg-surface)"
                      : "transparent",
                  borderRadius: "var(--p-border-radius-200)",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <SkeletonDisplayText size="small" />
                </div>
              </div>
            ))}
          </InlineGrid>
        </Box>

        {/* Two-column workspace: twoThirds form + oneThird preview */}
        <InlineGrid
          columns={{ xs: 1, md: ["twoThirds", "oneThird"] }}
          gap="400"
          alignItems="start"
        >
          {/* ── Main form card ── */}
          <Card>
            <BlockStack gap="500">
              {/* Visibility checkbox row */}
              <InlineStack gap="300" blockAlign="center">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
                <SkeletonDisplayText size="small" maxWidth="26ch" />
              </InlineStack>

              {/* Button text + subtitle (2-col) */}
              <InlineGrid columns={2} gap="400">
                {[10, 14].map((w, i) => (
                  <BlockStack key={i} gap="100">
                    <SkeletonDisplayText size="small" maxWidth={`${w}ch`} />
                    <div
                      style={{
                        height: 36,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                      }}
                    />
                  </BlockStack>
                ))}
              </InlineGrid>

              {/* Font size / style / icon (3-col) */}
              <InlineGrid columns={3} gap="300">
                {[0, 1, 2].map((i) => (
                  <BlockStack key={i} gap="100">
                    <SkeletonDisplayText size="small" maxWidth="8ch" />
                    <div
                      style={{
                        height: 36,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                      }}
                    />
                  </BlockStack>
                ))}
              </InlineGrid>

              {/* Animation + sticky position (2-col) */}
              <InlineGrid columns={2} gap="400">
                {[0, 1].map((i) => (
                  <BlockStack key={i} gap="100">
                    <SkeletonDisplayText size="small" maxWidth="10ch" />
                    <div
                      style={{
                        height: 36,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                      }}
                    />
                  </BlockStack>
                ))}
              </InlineGrid>

              {/* Background + text color pickers (2-col, tall) */}
              <InlineGrid columns={2} gap="400">
                {[16, 10].map((w, i) => (
                  <BlockStack key={i} gap="200">
                    <SkeletonDisplayText size="small" maxWidth={`${w}ch`} />
                    <div
                      style={{
                        height: 180,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                      }}
                    />
                    <div
                      style={{
                        height: 36,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                      }}
                    />
                  </BlockStack>
                ))}
              </InlineGrid>

              {/* Border color picker (full-width, tall) */}
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <div
                  style={{
                    height: 180,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: "var(--p-border-radius-200)",
                  }}
                />
                <div
                  style={{
                    height: 36,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: "var(--p-border-radius-200)",
                  }}
                />
              </BlockStack>

              {/* Border radius + border width sliders (2-col) */}
              <InlineGrid columns={2} gap="400">
                {[0, 1].map((i) => (
                  <BlockStack key={i} gap="100">
                    <SkeletonDisplayText size="small" maxWidth="12ch" />
                    <div
                      style={{
                        height: 20,
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: 10,
                        margin: "6px 0",
                      }}
                    />
                  </BlockStack>
                ))}
              </InlineGrid>

              {/* Shadow slider */}
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" maxWidth="8ch" />
                <div
                  style={{
                    height: 20,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 10,
                    margin: "6px 0",
                  }}
                />
              </BlockStack>

              {/* Width slider */}
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
                <div
                  style={{
                    height: 20,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 10,
                    margin: "6px 0",
                  }}
                />
              </BlockStack>

              {/* Checkboxes */}
              <InlineStack gap="300" blockAlign="center">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
                <SkeletonBodyText lines={1} />
              </InlineStack>
              <InlineStack gap="300" blockAlign="center">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
                <SkeletonBodyText lines={1} />
              </InlineStack>

              {/* Contact banner */}
              <div
                style={{
                  backgroundColor: "var(--p-color-bg-surface-secondary)",
                  borderRadius: "var(--p-border-radius-200)",
                  padding: 16,
                }}
              >
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: "var(--p-color-bg-surface)",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                  <BlockStack gap="100">
                    <SkeletonDisplayText size="small" maxWidth="22ch" />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                </InlineStack>
              </div>
            </BlockStack>
          </Card>

          {/* ── Preview sidebar ── */}
          <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
            <BlockStack gap="300">
              <InlineStack align="center">
                <SkeletonDisplayText size="small" maxWidth="12ch" />
              </InlineStack>
              <Card>
                <div
                  style={{
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: "var(--p-border-radius-300)",
                    padding: 16,
                    minHeight: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--p-color-bg-surface)",
                      borderRadius: "var(--p-border-radius-200)",
                      width: "85%",
                      height: 48,
                    }}
                  />
                </div>
              </Card>
              <InlineStack align="center">
                <div
                  style={{
                    width: 140,
                    height: 32,
                    backgroundColor: "var(--p-color-bg-surface-secondary)",
                    borderRadius: "var(--p-border-radius-200)",
                  }}
                />
              </InlineStack>
              <InlineStack align="center">
                <Box maxWidth="30ch">
                  <SkeletonBodyText lines={1} />
                </Box>
              </InlineStack>
            </BlockStack>
          </Box>
        </InlineGrid>
      </BlockStack>
    </SkeletonPage>
  );
}
