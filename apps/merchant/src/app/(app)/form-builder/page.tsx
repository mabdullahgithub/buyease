"use client";

import {
  Banner,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

export default function FormBuilderPage(): React.JSX.Element {
  return (
    <Page
      title="Form Builder"
      subtitle="Build your COD form experience with buyease."
      primaryAction={<Button variant="primary">Save draft</Button>}
    >
      <Layout>
        <Layout.Section>
          <Banner tone="success">Your form builder is ready to configure.</Banner>
        </Layout.Section>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Form content
                </Text>
                <Text as="p" variant="bodyMd">
                  Form title: <strong>Complete your order</strong>
                </Text>
                <Text as="p" variant="bodyMd">
                  CTA text: <strong>Place order</strong>
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Behavior
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Enable OTP, field rules, and conditional blocks in upcoming iterations.
                </Text>
                <Button>Open advanced rules</Button>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
