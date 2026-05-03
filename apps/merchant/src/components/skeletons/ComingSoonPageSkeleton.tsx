"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonThumbnail,
} from "@shopify/polaris";

/**
 * Mirrors {@link ComingSoonPage}: centered vertical stack (hero icon + heading + body).
 */
export function ComingSoonPageSkeleton(): ReactElement {
  return (
    <Page>
      <Box paddingBlockStart="1600" paddingBlockEnd="1600">
        <BlockStack gap="400" align="center" inlineAlign="center">
          <SkeletonThumbnail size="large" />
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
