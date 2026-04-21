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

/**
 * Form configuration workspace (fields, design, CTA).
 * Overview / onboarding lives at `/form-builder`.
 */
export default function FormBuilderEditorPage(): React.JSX.Element {
  return (
    <Page
      title="Form Builder"
      subtitle="Configure your COD checkout form for your storefront."
      primaryAction={<Button variant="primary">Save draft</Button>}
    >
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            Draft changes are saved here. Publish from your theme after the app embed is active.
          </Banner>
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
                  CTA label: <strong>Place order</strong>
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Behavior
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  OTP verification, field rules, and conditional blocks will appear here as they ship.
                </Text>
                <Button variant="secondary">Advanced rules</Button>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
