"use client";

import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  BlockStack,
  Text,
  Divider,
} from "@shopify/polaris";
import { useState } from "react";

type Settings = {
  webhookUrl: string;
  notificationEmail: string;
  defaultCurrency: string;
  timezone: string;
};

const CURRENCY_OPTIONS = [
  { label: "USD — US Dollar", value: "USD" },
  { label: "EUR — Euro", value: "EUR" },
  { label: "GBP — British Pound", value: "GBP" },
  { label: "SAR — Saudi Riyal", value: "SAR" },
  { label: "AED — UAE Dirham", value: "AED" },
  { label: "PKR — Pakistani Rupee", value: "PKR" },
];

const TIMEZONE_OPTIONS = [
  { label: "UTC", value: "UTC" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "Asia/Karachi", value: "Asia/Karachi" },
  { label: "Asia/Riyadh", value: "Asia/Riyadh" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    webhookUrl: "",
    notificationEmail: "",
    defaultCurrency: "USD",
    timezone: "UTC",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Page
      title="Settings"
      primaryAction={
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Save
        </Button>
      }
    >
      <Layout>
        {saved && (
          <Layout.Section>
            <Banner tone="success">Settings saved successfully.</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                General
              </Text>
              <FormLayout>
                <Select
                  label="Default Currency"
                  options={CURRENCY_OPTIONS}
                  value={settings.defaultCurrency}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, defaultCurrency: v }))
                  }
                />
                <Select
                  label="Timezone"
                  options={TIMEZONE_OPTIONS}
                  value={settings.timezone}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, timezone: v }))
                  }
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Notifications
              </Text>
              <FormLayout>
                <TextField
                  label="Notification Email"
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, notificationEmail: v }))
                  }
                  helpText="Receive order notifications at this address"
                  autoComplete="email"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Webhooks
              </Text>
              <Divider />
              <FormLayout>
                <TextField
                  label="Webhook Endpoint URL"
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, webhookUrl: v }))
                  }
                  helpText="BuyEase will POST order events to this URL"
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
