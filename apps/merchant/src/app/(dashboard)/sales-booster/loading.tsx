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

export default function SalesBoosterLoading(): ReactElement {
  return (
    <SkeletonPage title="Sales Booster">
      <BlockStack gap="400">
        {/* 3-tab mode selector */}
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={3} gap="100">
            {[0, 1, 2].map((i) => (
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

        {/* Feature cards — mirrors the upsells tab default view */}
        <div style={{ width: "65.5rem", maxWidth: "100%" }}>
          <BlockStack gap="400">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <InlineStack
                  align="space-between"
                  blockAlign="center"
                  gap="600"
                  wrap={false}
                >
                  <div style={{ flexGrow: 1 }}>
                    <BlockStack gap="300" inlineAlign="start">
                      <InlineStack gap="200" align="start" blockAlign="center">
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: "var(--p-color-bg-surface-secondary)",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        />
                        <SkeletonDisplayText size="small" />
                      </InlineStack>
                      <SkeletonBodyText lines={2} />
                      <div
                        style={{
                          width: 120,
                          height: 32,
                          backgroundColor: "var(--p-color-bg-surface-secondary)",
                          borderRadius: "var(--p-border-radius-200)",
                          marginTop: 4,
                        }}
                      />
                    </BlockStack>
                  </div>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "var(--p-color-bg-surface-secondary)",
                      borderRadius: "var(--p-border-radius-200)",
                      flexShrink: 0,
                    }}
                  />
                </InlineStack>
              </Card>
            ))}
          </BlockStack>
        </div>
      </BlockStack>
    </SkeletonPage>
  );
}
