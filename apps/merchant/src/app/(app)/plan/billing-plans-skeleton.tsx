import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

function PlanCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="start" wrap={false}>
          <Box minWidth="120px">
            <SkeletonDisplayText size="small" />
          </Box>
          <Box minWidth="72px" maxWidth="96px">
            <SkeletonBodyText lines={1} />
          </Box>
        </InlineStack>
        <SkeletonDisplayText maxWidth="100%" size="large" />
        <SkeletonBodyText lines={1} />
        <BlockStack gap="200">
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
        </BlockStack>
        <Box paddingBlockStart="200">
          <SkeletonDisplayText maxWidth="100%" size="small" />
        </Box>
      </BlockStack>
    </Card>
  );
}

/**
 * Route-level skeleton for Billing Plans — Polaris shimmer, zero extra JS.
 */
export default function BillingPlansPageSkeleton(): React.JSX.Element {
  return (
    <SkeletonPage fullWidth>
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            <BlockStack gap="300">
              <SkeletonDisplayText maxWidth="32ch" size="large" />
              <Box maxWidth="520px">
                <SkeletonBodyText lines={2} />
              </Box>
            </BlockStack>

            <Box
              background="bg-surface-secondary"
              padding="500"
              borderRadius="300"
            >
              <BlockStack gap="400" inlineAlign="center">
                <InlineStack gap="300" wrap blockAlign="center" align="center">
                  <Box minWidth="200px" maxWidth="240px">
                    <SkeletonDisplayText maxWidth="100%" size="small" />
                  </Box>
                  <Box minWidth="160px" maxWidth="200px">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </InlineStack>
                <InlineStack gap="300" wrap blockAlign="end" align="center">
                  <Box minWidth="220px" maxWidth="100%">
                    <SkeletonBodyText lines={1} />
                  </Box>
                  <SkeletonDisplayText maxWidth="10ch" size="small" />
                </InlineStack>
              </BlockStack>
            </Box>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
            </InlineGrid>

            <Box
              background="bg-surface-secondary"
              padding="500"
              borderRadius="300"
            >
              <BlockStack gap="300">
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
              </BlockStack>
            </Box>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
