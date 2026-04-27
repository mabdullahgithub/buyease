"use client";

import {
  BlockStack,
  Box,
  Card,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import type { ReactElement } from "react";

export default function DashboardLoading(): ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <SkeletonDisplayText size="large" />
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={4} />
          </BlockStack>
        </Card>
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={6} />
          </BlockStack>
        </Card>
        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
