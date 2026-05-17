"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  InlineGrid,
  Page,
} from "@shopify/polaris";
import {
  ButtonIcon,
  DeliveryIcon,
  FormsIcon,
  QuestionCircleIcon,
  SettingsIcon,
  ThemeEditIcon,
} from "@shopify/polaris-icons";

import { useShopifyBridge } from "@/lib/use-shopify-bridge";
import { buildThemeEditorUrl } from "@/lib/shopify-urls";

import { BuyButtonDesignerWorkspace } from "@/components/form-builder/BuyButtonDesignerWorkspace";
import { FormDesignerWorkspace } from "@/components/form-builder/FormDesignerWorkspace";
import { SettingsWorkspace } from "@/components/form-builder/SettingsWorkspace";
import { ShippingRatesWorkspace } from "@/components/form-builder/ShippingRatesWorkspace";

type FormBuilderMode = "buy-button" | "form-designer" | "shipping-rates" | "settings";

type ModeConfig = {
  id: FormBuilderMode;
  label: string;
  icon: IconSource;
};

const MODES: ModeConfig[] = [
  { id: "buy-button",     label: "Buy Button",     icon: ButtonIcon   },
  { id: "form-designer",  label: "Form Designer",  icon: FormsIcon    },
  { id: "shipping-rates", label: "Shipping Rates", icon: DeliveryIcon },
  { id: "settings",       label: "Settings",       icon: SettingsIcon },
];

/**
 * Form Builder workspace: Polaris-only layout aligned with Built for Shopify patterns
 * (page structure, cards, fitted tabs, EmptyState placeholder).
 */
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
      const data = (await res.json()) as { enabled: boolean | null; reason?: string };
      setEmbedEnabled(data.enabled ?? null);
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

  const embedStatusBadge =
    embedEnabled === true ? <Badge tone="success">Form enabled</Badge> : null;

  const secondaryActions = embedEnabled === true
    ? [
        {
          content: "Disable form",
          icon: ThemeEditIcon,
          url: themeEditorUrl || undefined,
          target: "_blank" as const,
          destructive: true,
          disabled: !themeEditorUrl,
        },
      ]
    : [
        {
          content: "How to enable",
          icon: QuestionCircleIcon,
          onAction: () => setMode("settings"),
        },
        {
          content: "Enable form",
          icon: ThemeEditIcon,
          url: themeEditorUrl || undefined,
          target: "_blank" as const,
          disabled: !themeEditorUrl,
        },
      ];

  return (
    <Page
      title="Form Builder"
      subtitle={
        mode === "buy-button"
          ? "Design your COD buy button and preview it before publishing to your storefront."
          : undefined
      }
      titleMetadata={embedStatusBadge}
      secondaryActions={secondaryActions}
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

        <div style={{ width: "100%", minWidth: 0 }}>
        {mode === "buy-button" ? (
          <BuyButtonDesignerWorkspace />
        ) : mode === "form-designer" ? (
          <FormDesignerWorkspace onNavigateToBuyButton={() => setMode("buy-button")} />
        ) : mode === "shipping-rates" ? (
          <ShippingRatesWorkspace />
        ) : (
          <SettingsWorkspace embedEnabled={embedEnabled} />
        )}
        </div>
      </BlockStack>
    </Page>
  );
}
