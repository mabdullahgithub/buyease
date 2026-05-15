"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  EmptyState,
  Icon,
  InlineGrid,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import {
  ButtonIcon,
  DeliveryIcon,
  FormsIcon,
  SettingsIcon,
  TabletIcon,
  ThemeEditIcon,
} from "@shopify/polaris-icons";

import { useShopifyBridge } from "@/lib/use-shopify-bridge";

import { BuyButtonDesignerWorkspace } from "@/components/form-builder/BuyButtonDesignerWorkspace";
import { FormDesignerWorkspace } from "@/components/form-builder/FormDesignerWorkspace";
import { SettingsWorkspace } from "@/components/form-builder/SettingsWorkspace";
import { ShippingRatesWorkspace } from "@/components/form-builder/ShippingRatesWorkspace";

/** Official Polaris empty-state illustration (decorative); required by `EmptyState`. */
const FORM_BUILDER_EMPTY_ILLUSTRATION =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

const BUYEASE_MARKETING_URL = "https://buyease-landing.vercel.app/";

type FormBuilderMode = "buy-button" | "form-designer" | "shipping-rates" | "settings";

type ModeConfig = {
  id: FormBuilderMode;
  label: string;
  icon: IconSource;
  description: string;
  /** Short, actionable empty-state headline (Polaris content guidance). */
  emptyHeading: string;
};

const MODES: ModeConfig[] = [
  {
    id: "buy-button",
    label: "Buy Button",
    icon: ButtonIcon,
    emptyHeading: "Customize how customers start COD checkout",
    description:
      "Control where the COD buy button appears, how it looks, and how it opens your form.",
  },
  {
    id: "form-designer",
    label: "Form Designer",
    icon: FormsIcon,
    emptyHeading: "Build the fields shoppers complete before COD",
    description:
      "Reorder fields, set required inputs, and match your brand while keeping conversions high.",
  },
  {
    id: "shipping-rates",
    label: "Shipping Rates",
    icon: DeliveryIcon,
    emptyHeading: "Show clear delivery options before the order",
    description:
      "Publish rates and timelines so COD customers understand cost and speed up front.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    emptyHeading: "Configure how your COD form behaves",
    description:
      "Set up form visibility, placement restrictions, form options, and custom styles.",
  },
];

/**
 * Form Builder workspace: Polaris-only layout aligned with Built for Shopify patterns
 * (page structure, cards, fitted tabs, EmptyState placeholder).
 */
const SHOPIFY_API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";
const EXTENSION_HANDLE = "cod-form";

function buildThemeEditorUrl(shopDomain: string): string {
  if (!shopDomain) return "";
  const storeName = shopDomain.replace(".myshopify.com", "");
  return `https://admin.shopify.com/store/${storeName}/themes/current/editor?context=apps&appEmbed=${SHOPIFY_API_KEY}%2F${EXTENSION_HANDLE}`;
}

export function FormBuilderPageContent(): ReactElement {
  const [mode, setMode] = useState<FormBuilderMode>("buy-button");
  const [themeEditorUrl, setThemeEditorUrl] = useState("");
  const [embedEnabled, setEmbedEnabled] = useState<boolean | null>(null);
  const shopify = useShopifyBridge();

  const fetchEmbedStatus = useCallback(async (): Promise<void> => {
    try {
      const token = await shopify.idToken();
      if (!token) return;
      const res = await fetch("/api/theme-embed-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { enabled: boolean };
      setEmbedEnabled(data.enabled);
    } catch {
      // leave as null — unknown state
    }
  }, [shopify]);

  useEffect(() => {
    const domain: string = (window as Window & { shopify?: { config?: { shop?: string } } }).shopify?.config?.shop ?? "";
    if (domain) setThemeEditorUrl(buildThemeEditorUrl(domain));
    void fetchEmbedStatus();
  }, [fetchEmbedStatus]);

  useEffect(() => {
    const onVisible = (): void => {
      if (!document.hidden) void fetchEmbedStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchEmbedStatus]);

  const handleModeChange = useCallback((next: FormBuilderMode): void => {
    setMode(next);
  }, []);

  const active = MODES.find((m) => m.id === mode) ?? MODES[0]!;

  const embedStatusBadge =
    embedEnabled === true ? (
      <Badge tone="success">Form enabled</Badge>
    ) : embedEnabled === false ? (
      <Badge tone="attention">Form not enabled</Badge>
    ) : null;

  return (
    <Page
      title="Form Builder"
      subtitle={
        mode === "buy-button"
          ? "Design your COD buy button and preview it before publishing to your storefront."
          : undefined
      }
      titleMetadata={
        <>
          <Badge tone="success">New</Badge>
          {embedStatusBadge}
        </>
      }
      secondaryActions={[
        {
          content: "Enable form",
          icon: ThemeEditIcon,
          url: themeEditorUrl || undefined,
          target: "_blank",
          disabled: !themeEditorUrl,
        },
      ]}
    >
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={4} gap="100">
            {MODES.map((item) => {
              const isSelected = mode === item.id;
              return (
                <Button
                  key={item.id}
                  icon={item.icon}
                  variant={isSelected ? "primary" : "tertiary"}
                  pressed={false} // Remove the native pressed styling in favor of variant switching
                  fullWidth
                  onClick={() => handleModeChange(item.id)}
                >
                  {item.label}
                </Button>
              );
            })}
          </InlineGrid>
        </Box>

        {mode === "buy-button" ? (
          <BuyButtonDesignerWorkspace />
        ) : mode === "form-designer" ? (
          <FormDesignerWorkspace onNavigateToBuyButton={() => setMode("buy-button")} />
        ) : mode === "shipping-rates" ? (
          <ShippingRatesWorkspace />
        ) : mode === "settings" ? (
          <SettingsWorkspace />
        ) : (
          <InlineGrid
            columns={{
              xs: 1,
              md: ["twoThirds", "oneThird"],
            }}
            gap="400"
            alignItems="start"
          >
            <Card roundedAbove="sm">
              <BlockStack gap="0">
                <EmptyState
                  image={FORM_BUILDER_EMPTY_ILLUSTRATION}
                  imageContained
                  heading={active.emptyHeading}
                  secondaryAction={{
                    content: "Learn more about BuyEase",
                    url: BUYEASE_MARKETING_URL,
                    target: "_blank",
                  }}
                >
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      {active.description}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      This editor is not available yet. You can move between workspaces now; settings
                      will save here once each flow ships.
                    </Text>
                  </BlockStack>
                </EmptyState>
                <Divider />
                <Box paddingBlockStart="400" paddingBlockEnd="100" paddingInline="500">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Tip: keep one goal per tab—button visibility, form questions, then delivery—so
                    shoppers get a consistent COD experience.
                  </Text>
                </Box>
              </BlockStack>
            </Card>

            <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingSm">
                      Live preview
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Storefront preview for this workspace—updates when you publish changes here.
                      Coming soon for {active.label}.
                    </Text>
                  </BlockStack>
                  <Box
                    background="bg-surface-secondary"
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="300"
                    padding="400"
                    minHeight="320px"
                  >
                    <BlockStack gap="300" inlineAlign="center">
                      <Icon source={TabletIcon} tone="subdued" />
                      <Box width="100%">
                        <SkeletonBodyText lines={6} />
                      </Box>
                      <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                        Preview placeholder
                      </Text>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </Card>
            </Box>
          </InlineGrid>
        )}
      </BlockStack>
    </Page>
  );
}
