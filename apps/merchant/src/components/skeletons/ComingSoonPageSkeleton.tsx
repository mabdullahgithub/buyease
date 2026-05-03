"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

/**
 * Mirrors {@link ComingSoonPage}: centered vertical stack (hero icon + heading + body).
 */
export function ComingSoonPageSkeleton(): ReactElement {
  return (
    <Page>
      <Box paddingBlockStart="1600" paddingBlockEnd="1600">
        <BlockStack gap="400" align="center" inlineAlign="center">
          <Box
            minHeight="48px"
            minWidth="48px"
            borderRadius="full"
            background="bg-surface-secondary"
          />
          <Box maxWidth="16ch">
            <SkeletonDisplayText maxWidth="100%" size="medium" />
          </Box>
          <Box maxWidth="28ch">
            <SkeletonBodyText lines={2} />
          </Box>
        </BlockStack>
      </Box>
    </Page>
  );
}
