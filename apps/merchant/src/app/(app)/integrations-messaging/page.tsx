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

const INTEGRATIONS = [
  { id: "whatsapp", name: "WhatsApp", status: "Not connected" },
  { id: "sms", name: "SMS Gateway", status: "Not connected" },
  { id: "email", name: "Email Notifications", status: "Connected" },
];

export default function IntegrationsMessagingPage(): React.JSX.Element {
  return (
    <Page
      title="Integrations & Messaging"
      subtitle="Connect channels for confirmations and abandoned COD follow-ups."
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              {INTEGRATIONS.map((integration) => (
                <InlineStack
                  key={integration.id}
                  align="space-between"
                  blockAlign="center"
                >
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingSm">
                      {integration.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Manage provider credentials and event triggers.
                    </Text>
                  </BlockStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={integration.status === "Connected" ? "success" : undefined}>
                      {integration.status}
                    </Badge>
                    <Button>{integration.status === "Connected" ? "Manage" : "Connect"}</Button>
                  </InlineStack>
                </InlineStack>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
