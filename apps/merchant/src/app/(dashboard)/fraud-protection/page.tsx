"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { CheckCircleIcon, ShieldCheckMarkIcon } from "@shopify/polaris-icons";

function FeatureLine({ children }: { children: ReactNode }): ReactElement {
  return (
    <InlineStack gap="200" blockAlign="start" wrap={false}>
      <Box minWidth="20px">
        <Icon source={CheckCircleIcon} tone="success" />
      </Box>
      <Text as="span" variant="bodyMd">
        {children}
      </Text>
    </InlineStack>
  );
}

export default function FraudProtectionPage(): ReactElement {
  return (
    <Page
      title="Fraud Protection"
      subtitle="Layered checks help you stop abusive COD orders, wrong numbers, and repeat chargebacks — before they cost you fulfilment."
    >
      <BlockStack gap="500">
        <Banner tone="info" title="Configuration hub coming soon">
          <Text as="p" variant="bodyMd">
            Per-store fraud rules and OTP thresholds will appear here as the COD form rollout
            continues. Your active plan already determines which protections are enabled at checkout.
          </Text>
        </Banner>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={ShieldCheckMarkIcon} tone="base" />
                  <Text as="h2" variant="headingMd">
                    Basic fraud (all plans)
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Core COD hygiene for every merchant: lighter friction, steady conversion.
                </Text>
                <BlockStack gap="200">
                  <FeatureLine>
                    Checkout field validation and basic risk signals on every COD submission.
                  </FeatureLine>
                  <FeatureLine>
                    Address validation with Google Places when enabled for your storefront form.
                  </FeatureLine>
                  <FeatureLine>
                    Monthly order caps on the Free plan reduce scripted or repeat fake orders.
                  </FeatureLine>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={ShieldCheckMarkIcon} tone="magic" />
                  <Text as="h2" variant="headingMd">
                    Advanced fraud (Premium and up)
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Stronger signals and messaging for higher-volume COD stores.
                </Text>
                <BlockStack gap="200">
                  <FeatureLine>
                    Stricter behavioural checks and anomaly signals at submit time.
                  </FeatureLine>
                  <FeatureLine>
                    SMS OTP and WhatsApp OTP paths for number verification before confirm.
                  </FeatureLine>
                  <FeatureLine>
                    Priority routing for review when multiple risk flags fire together.
                  </FeatureLine>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card roundedAbove="sm">
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Upgrade for deeper protection
                </Text>
                <Text as="p" variant="bodyMd">
                  Advanced fraud prevention unlocks with Premium and above. Manage your subscription
                  anytime.
                </Text>
                <Box>
                  <Button variant="primary" url="/billing">
                    View billing plans
                  </Button>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
