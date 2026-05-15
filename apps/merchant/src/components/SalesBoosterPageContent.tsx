"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import {
  CartAbandonedIcon,
  CartDiscountIcon,
  CartUpIcon,
} from "@shopify/polaris-icons";

type SalesBoosterTab = "upsells-downsells" | "quantity-offers" | "abandoned-cart";

type TabConfig = {
  id: SalesBoosterTab;
  label: string;
  icon: IconSource;
  comingSoonHeading: string;
  comingSoonDescription: string;
};

const TABS: TabConfig[] = [
  {
    id: "upsells-downsells",
    label: "Upsells & Downsells",
    icon: CartUpIcon,
    comingSoonHeading: "Upsells & Downsells — Coming Soon",
    comingSoonDescription:
      "Boost your average order value with smart pre-purchase and post-purchase upsell and downsell offers.",
  },
  {
    id: "quantity-offers",
    label: "Quantity Offers",
    icon: CartDiscountIcon,
    comingSoonHeading: "Quantity Offers — Coming Soon",
    comingSoonDescription:
      "Incentivize customers to buy more by unlocking discounts when they add multiple items to their order.",
  },
  {
    id: "abandoned-cart",
    label: "Abandoned cart",
    icon: CartAbandonedIcon,
    comingSoonHeading: "Abandoned Cart Recovery — Coming Soon",
    comingSoonDescription:
      "Automatically follow up with customers who left items in their cart and recover lost sales.",
  },
];

const COMING_SOON_ILLUSTRATION =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

export function SalesBoosterPageContent(): ReactElement {
  const [activeTab, setActiveTab] = useState<SalesBoosterTab>("upsells-downsells");

  const handleTabChange = useCallback((tab: SalesBoosterTab): void => {
    setActiveTab(tab);
  }, []);

  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0]!;

  return (
    <Page title="Sales Booster">
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={3} gap="100">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  icon={tab.icon}
                  variant={isSelected ? "primary" : "tertiary"}
                  fullWidth
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </Button>
              );
            })}
          </InlineGrid>
        </Box>

        <Card>
          <EmptyState
            image={COMING_SOON_ILLUSTRATION}
            imageContained
            heading={active.comingSoonHeading}
          >
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd" tone="subdued">
                {active.comingSoonDescription}
              </Text>
              <InlineStack>
                <Badge tone="attention">Coming Soon</Badge>
              </InlineStack>
            </BlockStack>
          </EmptyState>
        </Card>
      </BlockStack>
    </Page>
  );
}
