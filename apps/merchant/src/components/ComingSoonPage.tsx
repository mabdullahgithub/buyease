"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Icon,
  Page,
  Text,
} from "@shopify/polaris";
import { ClockIcon, CheckCircleIcon } from "@shopify/polaris-icons";

type ComingSoonPageProps = {
  title: string;
};

/**
 * Shared "Coming Soon" placeholder used across all feature pages
 * that are not yet implemented. Pure Polaris — no custom HTML/CSS.
 */
export function ComingSoonPage({ title }: ComingSoonPageProps): ReactElement {
  return (
    <Page title={title}>
      <Box paddingBlockStart="1600" paddingBlockEnd="1600">
        <BlockStack gap="400" align="center" inlineAlign="center">
          <Icon source={CheckCircleIcon} tone="success" />
          <Text as="h2" variant="headingLg" alignment="center">
            Connected
          </Text>
          <BlockStack gap="200" align="center" inlineAlign="center">
            <Icon source={ClockIcon} tone="subdued" />
            <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
              Coming Soon
            </Text>
          </BlockStack>
        </BlockStack>
      </Box>
    </Page>
  );
}
