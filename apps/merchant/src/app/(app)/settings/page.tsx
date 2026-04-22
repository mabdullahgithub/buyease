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
  List,
  Link,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SHOPIFY_EMBED_STORAGE_KEY } from "@/lib/shopify-embed-session-storage";

declare global {
  interface Window {
    shopify?: {
      idToken?: () => Promise<string>;
    };
  }
}

async function getShopifySessionToken(): Promise<string | null> {
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    const idTokenFn = window.shopify?.idToken;
    if (typeof idTokenFn === "function") {
      try {
        return await idTokenFn.call(window.shopify);
      } catch {
        return null;
      }
    }
    await new Promise((r) => setTimeout(r, 40));
  }
  return null;
}

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = useMemo(() => !settingsEqual(settings, baseline), [settings, baseline]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getShopifySessionToken();
        if (!token) {
          if (!cancelled) {
            setLoadError("Couldn't authenticate with Shopify — please reload the page.");
            setLoading(false);
          }
          return;
        }
        const res = await fetch("/api/settings", {
          credentials: "same-origin",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to load settings (${res.status})`);
        }
        const data = (await res.json()) as { settings?: Settings };
        if (cancelled) return;
        if (data.settings) {
          setBaseline(data.settings);
          setSettings(data.settings);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDiscard = useCallback(() => {
    setSettings({ ...baseline });
    setSaveError(null);
  }, [baseline]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = await getShopifySessionToken();
      if (!token) {
        throw new Error("Couldn't authenticate with Shopify — please reload the page.");
      }
      const res = await fetch("/api/settings", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        let message = `Failed to save settings (${res.status})`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {
          /* no JSON body */
        }
        throw new Error(message);
      }
      const data = (await res.json()) as { settings?: Settings };
      const nextBaseline = data.settings ?? settings;
      setBaseline(nextBaseline);
      setSettings(nextBaseline);
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 4000);
      try {
        shopify.toast.show("Settings saved");
      } catch {
        /* App Bridge toast unavailable outside embedded admin */
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save settings.");
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
      <SaveBar id={SETTINGS_SAVE_BAR_ID} open={isDirty && !loading}>
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
        {loadError && (
          <Layout.Section>
            <Banner tone="critical" onDismiss={() => setLoadError(null)}>
              {loadError}
            </Banner>
          </Layout.Section>
        )}

        {saveError && (
          <Layout.Section>
            <Banner tone="critical" onDismiss={() => setSaveError(null)}>
              {saveError}
            </Banner>
          </Layout.Section>
        )}

        {savedBanner && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setSavedBanner(false)}>
              Settings saved successfully.
            </Banner>
          </Layout.Section>
        )}

        {loading && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={4} />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {!loading && (
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
        )}

        {!loading && (
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
        )}

        {!loading && (
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
                    helpText="BuyEase will POST order events to this URL (must be https)"
                    autoComplete="off"
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Built for Shopify readiness
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Use this checklist before submitting updates in the Shopify Partner
                Dashboard Distribution page.
              </Text>
              <List type="bullet">
                <List.Item>
                  Install path: Shopify-initiated OAuth only (manual shop-domain form disabled).
                </List.Item>
                <List.Item>
                  Billing model: fully free app with no external charging.
                </List.Item>
                <List.Item>
                  Distribution prerequisites: sufficient installs, review volume, rating,
                  and account standing validated in Partner Dashboard.
                </List.Item>
              </List>
              <Text as="p" variant="bodySm" tone="subdued">
                Review in Shopify Partner Dashboard:{" "}
                <Link
                  url="https://partners.shopify.com/current/apps"
                  target="_blank"
                  removeUnderline={false}
                >
                  Apps → Distribution
                </Link>
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Performance thresholds to monitor
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Built for Shopify performance guardrails should remain within these limits.
              </Text>
              <List type="bullet">
                <List.Item>LCP: under 1.2s</List.Item>
                <List.Item>CLS: under 0.05</List.Item>
                <List.Item>INP: under 100ms</List.Item>
                <List.Item>
                  Track checkout/storefront experience continuously with production RUM
                  or Lighthouse CI.
                </List.Item>
              </List>
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
