"use client";

import { useEffect } from "react";
import { Banner, BlockStack, Button, Page } from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // After a deployment the browser holds stale chunk URLs. A hard reload
    // picks up the new bundles automatically.
    if (
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch dynamically imported module")
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <Page>
      <BlockStack gap="400">
        <Banner title="Something went wrong" tone="critical">
          <p>
            An unexpected error occurred. Please try again, or contact support if
            the problem persists.
            {error.digest ? ` (ref: ${error.digest})` : ""}
          </p>
        </Banner>
        <Button icon={RefreshIcon} onClick={reset}>
          Try again
        </Button>
      </BlockStack>
    </Page>
  );
}
