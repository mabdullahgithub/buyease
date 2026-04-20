"use client";

import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

const ACTIVE_OFFERS = [
  {
    id: "offer-1",
    title: "Post-purchase accessories bundle",
    discount: "15%",
    trigger: "Any COD order over $30",
  },
];

export default function UpsellsDownsellsPage(): React.JSX.Element {
  return (
    <Page
      title="Upsells & Downsells"
      subtitle="Show contextual offers right after checkout intent."
      primaryAction={<Button variant="primary">Create offer</Button>}
    >
      <Layout>
        {ACTIVE_OFFERS.map((offer) => (
          <Layout.Section key={offer.id}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {offer.title}
                  </Text>
                  <Badge tone="success">Active</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Trigger: {offer.trigger}
                </Text>
                <Text as="p" variant="bodyMd">
                  Discount: {offer.discount}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
