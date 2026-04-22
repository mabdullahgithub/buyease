"use client";

import {
  AppProvider,
  SkeletonPage,
  Layout,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  BlockStack,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

/**
 * Polaris skeleton used as the merchant-app shell loading fallback.
 * Replaces any blank (`null`) fallback — BFS review expects a framed
 * skeleton state, never an empty iframe, while Polaris + App Bridge hydrate.
 */
export function MerchantAppSkeleton(): React.JSX.Element {
  return (
    <AppProvider i18n={enTranslations}>
      <SkeletonPage primaryAction>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={3} />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={5} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    </AppProvider>
  );
}

/**
 * Inner-page (already inside `AppProvider`) variant for Suspense fallbacks
 * around dynamically imported page content.
 */
export function MerchantPageSkeleton(): React.JSX.Element {
  return (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={4} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
