"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  DataTable,
  BlockStack,
  InlineGrid,
} from "@shopify/polaris";
import { formatCurrency } from "@buyease/utils";

export function AnalyticsClient({
  totalOrders,
  deliveredOrders,
  cancelledOrders,
  totalRevenue,
  conversionRate,
  cancelRate,
}: {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  conversionRate: string;
  cancelRate: string;
}) {
  const summaryRows = [
    ["Total Orders", String(totalOrders)],
    ["Delivered", String(deliveredOrders)],
    ["Cancelled", String(cancelledOrders)],
    ["Total COD Revenue", formatCurrency(totalRevenue, "USD")],
    ["Delivery Rate", `${conversionRate}%`],
    ["Cancellation Rate", `${cancelRate}%`],
  ];

  return (
    <Page title="Analytics" subtitle="Last 30 days">
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">Total Revenue</Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {formatCurrency(totalRevenue, "USD")}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">Delivery Rate</Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {conversionRate}%
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">Cancel Rate</Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {cancelRate}%
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Order Summary</Text>
              <DataTable
                columnContentTypes={["text", "text"]}
                headings={["Metric", "Value"]}
                rows={summaryRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}