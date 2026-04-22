"use client";

import {
  AppProvider,
  BlockStack,
  Banner,
  Box,
  Card,
  InlineStack,
  Text,
  Page,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

type InstallCardProps = {
  hasAuthError: boolean;
  hasInvalidShop: boolean;
};

/**
 * The install page is rendered outside the embedded Shopify admin iframe,
 * so it ships its own `AppProvider`. BFS review expects Polaris fidelity on
 * every merchant-facing surface — not raw HTML.
 */
export function InstallCard({ hasAuthError, hasInvalidShop }: InstallCardProps): React.JSX.Element {
  return (
    <AppProvider i18n={enTranslations}>
      <Page narrowWidth>
        <Box paddingBlockStart="800" paddingBlockEnd="800">
          <BlockStack gap="400">
            <InlineStack align="center" blockAlign="center">
              <Text as="h1" variant="headingXl">
                Install BuyEase
              </Text>
            </InlineStack>

            {hasAuthError ? (
              <Banner tone="critical" title="Authentication did not complete">
                <p>
                  Re-open BuyEase from your Shopify Admin Apps page and try again.
                </p>
              </Banner>
            ) : null}

            {hasInvalidShop ? (
              <Banner tone="critical" title="Missing shop context">
                <p>The install request did not include a valid Shopify shop.</p>
              </Banner>
            ) : null}

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Install from Shopify Admin
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  BuyEase installation is initiated by Shopify only. Open the app
                  from your Shopify Admin Apps page to continue securely.
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Manual shop-domain entry has been disabled to meet Built for
                  Shopify installation requirements.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Box>
      </Page>
    </AppProvider>
  );
}
