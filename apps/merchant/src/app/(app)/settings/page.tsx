"use client";

import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
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
import { useCallback, useMemo, useState } from "react";
import { SHOPIFY_EMBED_STORAGE_KEY } from "@/lib/shopify-embed-session-storage";

/** Stable id for App Bridge `ui-save-bar` (contextual save bar in Shopify admin chrome). */
const SETTINGS_SAVE_BAR_ID = "buyease-settings-save-bar";

type Settings = {
  webhookUrl: string;
  notificationEmail: string;
  defaultCurrency: string;
  timezone: string;
};

const DEFAULT_SETTINGS: Settings = {
  webhookUrl: "",
  notificationEmail: "",
  defaultCurrency: "USD",
  timezone: "UTC",
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

function settingsEqual(a: Settings, b: Settings): boolean {
  return (
    a.webhookUrl === b.webhookUrl &&
    a.notificationEmail === b.notificationEmail &&
    a.defaultCurrency === b.defaultCurrency &&
    a.timezone === b.timezone
  );
}

export default function SettingsPage() {
  const shopify = useAppBridge();
  const [baseline, setBaseline] = useState<Settings>(DEFAULT_SETTINGS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [savedBanner, setSavedBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => !settingsEqual(settings, baseline), [settings, baseline]);

  const handleDiscard = useCallback(() => {
    setSettings({ ...baseline });
  }, [baseline]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setBaseline({ ...settings });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 4000);
      try {
        shopify.toast.show("Settings saved");
      } catch {
        /* App Bridge toast unavailable outside embedded admin */
      }
    } finally {
      setSaving(false);
    }
  }, [settings, shopify]);

  return (
    <Page
      title="Settings"
      subtitle="Currency, notifications, and webhooks for this store"
    >
      {/*
        App Bridge requires native buttons inside `ui-save-bar` (not Polaris Button).
        @see https://shopify.dev/docs/api/app-home/apis/save-bar
      */}
      <SaveBar id={SETTINGS_SAVE_BAR_ID} open={isDirty}>
        <button type="button" disabled={saving} onClick={handleDiscard}>
          Discard
        </button>
        <button
          type="button"
          variant="primary"
          disabled={saving}
          onClick={() => {
            void handleSave();
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </SaveBar>

      <Layout>
        {savedBanner && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setSavedBanner(false)}>
              Settings saved successfully.
            </Banner>
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

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Session
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Log out clears BuyEase cookies and removes stored API sessions for
                this shop. Re-open the app from Shopify admin to sign in again.
              </Text>
              <form
                method="post"
                action="/api/auth/logout"
                target="_top"
                onSubmit={() => {
                  try {
                    sessionStorage.removeItem(SHOPIFY_EMBED_STORAGE_KEY);
                  } catch {
                    /* private mode / storage blocked */
                  }
                }}
              >
                <Button submit tone="critical">
                  Log out of BuyEase
                </Button>
              </form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
