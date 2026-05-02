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
  Page,
  Text,
} from "@shopify/polaris";
import {
  ButtonIcon,
  DeliveryIcon,
  FormsIcon,
} from "@shopify/polaris-icons";

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
 * (page structure, cards, segmented control, EmptyState placeholder).
 */
export function FormBuilderPageContent(): ReactElement {
  const [mode, setMode] = useState<FormBuilderMode>("buy-button");

  const handleModeChange = useCallback((next: FormBuilderMode): void => {
    setMode(next);
  }, []);

  const active = MODES.find((m) => m.id === mode) ?? MODES[0]!;

  return (
    <Page
      narrowWidth
      title="Form Builder"
      subtitle="Set up your COD buy button, form fields, and shipping before customers reach checkout."
      titleMetadata={<Badge tone="info">Coming soon</Badge>}
    >
      <BlockStack gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingSm">
                Workspace
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Pick a section to configure. Your selection updates the editor area below.
              </Text>
            </BlockStack>
            <Box
              padding="150"
              background="bg-surface"
              borderWidth="025"
              borderColor="border"
              borderRadius="300"
              shadow="100"
            >
              <ButtonGroup variant="segmented">
                {MODES.map((item) => (
                  <Button
                    key={item.id}
                    icon={item.icon}
                    pressed={mode === item.id}
                    onClick={() => handleModeChange(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </BlockStack>
        </Card>

        <Card roundedAbove="sm">
          <BlockStack gap="0">
            <EmptyState
              image={FORM_BUILDER_EMPTY_ILLUSTRATION}
              imageContained
              heading={active.emptyHeading}
              secondaryAction={{
                content: "Learn more about BuyEase",
                url: BUYEASE_MARKETING_URL,
                external: true,
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
      </BlockStack>
    </Page>
  );
}
