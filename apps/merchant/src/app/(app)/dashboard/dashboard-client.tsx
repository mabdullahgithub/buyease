"use client";

import { Box, Card, Layout, BlockStack, InlineGrid, Page, Text } from "@shopify/polaris";

type DashboardClientProps = {
  shop: string;
  totalOrders: number;
  totalRevenue: number;
  plan: string;
};

export function DashboardClient({
  shop,
  totalOrders,
  totalRevenue,
  plan,
}: DashboardClientProps): React.JSX.Element {
  return (
    <Page title="Dashboard" subtitle={`Shop: ${shop}`}>
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Orders
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {totalOrders.toLocaleString()}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  COD Revenue
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  ${totalRevenue.toFixed(2)}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Current Plan
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {plan}
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Getting Started
              </Text>
              <Box>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    1. Configure your COD form under <strong>COD Form</strong>.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    2. Set up upsell offers under <strong>Upsells</strong>.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    3. Review your order analytics under <strong>Analytics</strong>.
                  </Text>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}