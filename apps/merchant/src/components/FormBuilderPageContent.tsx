"use client";

import { useCallback, useState } from "react";
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
  TabletIcon,
} from "@shopify/polaris-icons";

import { BuyButtonDesignerWorkspace } from "@/components/form-builder/BuyButtonDesignerWorkspace";
import { ShippingRatesWorkspace } from "@/components/form-builder/ShippingRatesWorkspace";

/** Official Polaris empty-state illustration (decorative); required by `EmptyState`. */
const FORM_BUILDER_EMPTY_ILLUSTRATION =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

const BUYEASE_MARKETING_URL = "https://buyease-landing.vercel.app/";

type FormBuilderMode = "buy-button" | "form-designer" | "shipping-rates";

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
];

/**
 * Form Builder workspace: Polaris-only layout aligned with Built for Shopify patterns
 * (page structure, cards, fitted tabs, EmptyState placeholder).
 */
export function FormBuilderPageContent(): ReactElement {
  const [mode, setMode] = useState<FormBuilderMode>("buy-button");

  const handleModeChange = useCallback((next: FormBuilderMode): void => {
    setMode(next);
  }, []);

  const active = MODES.find((m) => m.id === mode) ?? MODES[0]!;

  return (
    <Page
      title="Form Builder"
      subtitle={
        mode === "buy-button"
          ? "Design your COD buy button and preview it before publishing to your storefront."
          : undefined
      }
      titleMetadata={
        mode === "buy-button" || mode === "shipping-rates" ? (
          <Badge tone="success">New</Badge>
        ) : (
          <Badge tone="info">Coming soon</Badge>
        )
      }
    >
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={3} gap="100">
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
        ) : mode === "shipping-rates" ? (
          <ShippingRatesWorkspace />
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
