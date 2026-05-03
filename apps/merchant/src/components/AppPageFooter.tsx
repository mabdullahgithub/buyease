"use client";

import type { ReactElement } from "react";
import { BlockStack, Box, Text } from "@shopify/polaris";

/**
 * Shared footer for embedded merchant pages (matches Billing / pricing styling).
 */
export function AppPageFooter(): ReactElement {
  return (
    <Box paddingBlockStart="400" paddingBlockEnd="400" width="100%">
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" tone="subdued" alignment="center">
          &copy; BuyEase 2026 🇵🇰
        </Text>
      </BlockStack>
    </Box>
  );
}
