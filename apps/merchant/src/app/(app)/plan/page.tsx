"use client";

import {
  BlockStack,
  Box,
  Card,
  Layout,
  Page,
  List,
  Text,
} from "@shopify/polaris";

export default function PlanPage(): React.JSX.Element {
  return (
    <Page title="Billing" subtitle="BuyEase is currently offered as a fully free Shopify app.">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Current billing model
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                There are no in-app upgrades and no external charging flow in BuyEase at
                this time. All merchants are on the same free plan.
              </Text>
              <Box>
                <List type="bullet">
                  <List.Item>$0 monthly charge for all stores.</List.Item>
                  <List.Item>No card collection outside Shopify.</List.Item>
                  <List.Item>No third-party billing links or checkout redirects.</List.Item>
                </List>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
