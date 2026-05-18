"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Card,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

export default function OffersBundlesLoading(): ReactElement {
  return (
    <SkeletonPage title="Offers & Bundles">
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
        <BlockStack gap="400">
          {[0, 1].map((i) => (
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
                    width: 100,
                    height: 100,
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
    </SkeletonPage>
  );
}
