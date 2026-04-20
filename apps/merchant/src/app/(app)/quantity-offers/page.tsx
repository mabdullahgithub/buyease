"use client";

import {
  Button,
  Card,
  EmptyState,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

export default function QuantityOffersPage(): React.JSX.Element {
  return (
    <Page
      title="Quantity Offers"
      subtitle="Increase average order value with volume discounts."
      primaryAction={<Button variant="primary">Create offer</Button>}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="No quantity offers yet"
              action={{ content: "Create your first offer" }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <Text as="p" variant="bodyMd">
                Configure tiered discounts such as Buy 2 Save 10% and Buy 3 Save
                15%.
              </Text>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
