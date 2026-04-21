"use client";

import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

const PLANS = [
  { id: "free", name: "Free", price: "$0/mo", isCurrent: true, badge: "Current" },
  { id: "starter", name: "Starter", price: "$19/mo", isCurrent: false, badge: "Popular" },
  { id: "growth", name: "Growth", price: "$49/mo", isCurrent: false, badge: "Scale" },
];

export default function PlanPage(): React.JSX.Element {
  return (
    <Page title="Billing Plans" subtitle="Upgrade as your COD volume grows.">
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
            {PLANS.map((plan) => (
              <Card key={plan.id}>
                <BlockStack gap="300">
                  <Badge tone={plan.isCurrent ? "success" : undefined}>
                    {plan.badge}
                  </Badge>
                  <Text as="h2" variant="headingMd">
                    {plan.name}
                  </Text>
                  <Text as="p" variant="headingLg">
                    {plan.price}
                  </Text>
                  <Button variant={plan.isCurrent ? "secondary" : "primary"}>
                    {plan.isCurrent ? "Current plan" : "Upgrade"}
                  </Button>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
