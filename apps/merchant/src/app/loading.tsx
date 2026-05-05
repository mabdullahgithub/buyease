"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

/**
 * Root-level loading skeleton. Full-width Polaris page shell with content cards.
 */
export default function RootLoading(): ReactElement {
  return (
    <SkeletonPage title="">
      <BlockStack gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={3} />
          </BlockStack>
        </Card>
        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </BlockStack>
        </Card>
      </BlockStack>
    </SkeletonPage>
  );
}
