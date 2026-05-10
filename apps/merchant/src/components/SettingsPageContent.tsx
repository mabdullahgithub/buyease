"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  Page,
  Text,
} from "@shopify/polaris";
import {
  AlertCircleIcon,
  ChatIcon,
  ClockIcon,
  CodeIcon,
  ConnectIcon,
  DataTableIcon,
  ExternalIcon,
  SettingsIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

type SettingsTab =
  | "visibility"
  | "general"
  | "pixels"
  | "google-sheets"
  | "partners";

type TabConfig = {
  id: SettingsTab;
  label: string;
  icon: IconSource;
};

const TABS: TabConfig[] = [
  { id: "visibility", label: "Visibility", icon: ViewIcon },
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "pixels", label: "Pixels", icon: CodeIcon },
  { id: "google-sheets", label: "Google Sheets", icon: DataTableIcon },
  { id: "partners", label: "Partners & Integrations", icon: ConnectIcon },
];

const SHOPIFY_API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";
const EXTENSION_HANDLE = "cod-form";

function buildThemeEditorUrl(shopDomain: string): string {
  if (!shopDomain) return "";
  const storeName = shopDomain.replace(".myshopify.com", "");
  return `https://admin.shopify.com/store/${storeName}/themes/current/editor?context=apps&appEmbed=${SHOPIFY_API_KEY}%2F${EXTENSION_HANDLE}`;
}

function VisibilityTabContent(): ReactElement {
  const [themeEditorUrl, setThemeEditorUrl] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const domain: string =
      (
        window as Window & {
          shopify?: { config?: { shop?: string } };
        }
      ).shopify?.config?.shop ?? "";
    if (domain) setThemeEditorUrl(buildThemeEditorUrl(domain));
  }, []);

  return (
    <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
      <BlockStack gap="100">
        <Text as="h2" variant="headingMd">
          Visibility
        </Text>
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          BuyEase Activation
        </Text>
      </BlockStack>

      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={AlertCircleIcon} tone="critical" />
                <Text as="h3" variant="headingMd">
                  Start by enabling the app
                </Text>
              </InlineStack>
              <Link url="#" removeUnderline>
                Learn more
              </Link>
            </InlineStack>

            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Text as="p" variant="bodyMd">
                1. First, Open your theme by clicking on this button:
              </Text>
              <Button
                icon={ExternalIcon}
                variant="primary"
                url={themeEditorUrl || undefined}
                target="_blank"
                disabled={!themeEditorUrl}
              >
                Open theme
              </Button>
            </InlineStack>

            <Text as="p" variant="bodyMd">
              2. In the theme editor, click the{" "}
              <strong>Save</strong> button located at the top-right corner.
            </Text>

            <Box
              borderRadius="200"
              borderWidth="025"
              borderColor="border"
              overflowX="hidden"
              overflowY="hidden"
            >
              <Image
                src="/images/save-app-embed.png"
                alt="Theme editor Save button location"
                width={900}
                height={460}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>

            <Divider />

            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" variant="bodyMd">
                If you need help with this, feel free to{" "}
                <strong>contact us</strong> anytime!
              </Text>
              <Button icon={ChatIcon} variant="secondary">
                Chat with us
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {showBanner && (
          <Banner
            tone="info"
            onDismiss={() => {
              setShowBanner(false);
            }}
            action={{
              content: "How to enable the form on my store?",
              url: "#",
            }}
            secondaryAction={{ content: "Chat with us" }}
          >
            <Text as="p" variant="bodyMd">
              If you can&apos;t see the form in your store, or you need help to
              enable it, please contact us
            </Text>
          </Banner>
        )}
      </BlockStack>
    </InlineGrid>
  );
}

function ComingSoon(): ReactElement {
  return (
    <Box paddingBlockStart="1600" paddingBlockEnd="1600">
      <BlockStack gap="400" align="center" inlineAlign="center">
        <Icon source={ClockIcon} tone="subdued" />
        <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
          Coming Soon
        </Text>
      </BlockStack>
    </Box>
  );
}

export function SettingsPageContent(): ReactElement {
  const [activeTab, setActiveTab] = useState<SettingsTab>("visibility");

  const handleTabChange = useCallback((tab: SettingsTab): void => {
    setActiveTab(tab);
  }, []);

  return (
    <Page title="Settings & Integrations">
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={5} gap="100">
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                icon={tab.icon}
                variant={activeTab === tab.id ? "primary" : "tertiary"}
                size="slim"
                fullWidth
                onClick={() => {
                  handleTabChange(tab.id);
                }}
              >
                {" " + tab.label}
              </Button>
            ))}
          </InlineGrid>
        </Box>

        {activeTab === "visibility" ? <VisibilityTabContent /> : <ComingSoon />}
      </BlockStack>
    </Page>
  );
}
