"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  Icon,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import {
  CartAbandonedIcon,
  CartDiscountIcon,
  CartDownIcon,
  CartUpIcon,
  ClipboardChecklistIcon,
  GiftCardIcon,
  PlayCircleIcon,
} from "@shopify/polaris-icons";

type SalesBoosterTab = "upsells-downsells" | "quantity-offers" | "abandoned-cart";

type TabConfig = {
  id: SalesBoosterTab;
  label: string;
  icon: IconSource;
  comingSoonHeading?: string;
  comingSoonDescription?: string;
};

type UpsellFeatureItem = {
  id: string;
  icon: Parameters<typeof Icon>[0]["source"];
  title: string;
  description: ReactElement;
  buttonLabel: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

const TABS: TabConfig[] = [
  {
    id: "upsells-downsells",
    label: "Upsells & Downsells",
    icon: CartUpIcon,
  },
  {
    id: "quantity-offers",
    label: "Offers & Bundles",
    icon: CartDiscountIcon,
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

const UPSELL_FEATURES: UpsellFeatureItem[] = [
  {
    id: "one-click-upsells",
    icon: CartUpIcon,
    title: "1-Click Upsells",
    description: (
      <>
        <strong>1-Click upsells</strong> are extra offers shown to customers before they fill out
        the form or right after they complete their purchase. Create up to{" "}
        <strong>5 upsell offers</strong>. When the customer accept or reject an offer, the next
        offer will be shown.
      </>
    ),
    buttonLabel: "Configure One-Click Upsells",
    imageSrc: "/images/upsellsanddownsells/funnel.svg",
    imageAlt: "1-Click Upsells funnel illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
  {
    id: "order-bump",
    icon: ClipboardChecklistIcon,
    title: "1-Tick Upsell / Order Bump",
    description: (
      <>
        A quick <strong>1-Click upsell</strong>. A Tick box that adds a little extra $ to orders.
        <br />
        <strong>(Shipping protection, Priority processing, Extended warranty, Gift wrapping…)</strong>
      </>
    ),
    buttonLabel: "Configure One-Tick Upsells",
    imageSrc: "/images/upsellsanddownsells/bumps.svg",
    imageAlt: "Order bump checklist illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
  {
    id: "downsells",
    icon: CartDownIcon,
    title: "Downsells",
    description: (
      <>
        <strong>Pop-up discounts</strong> that incentivize customers to complete their purchases
        when they close the form. This can help recover potential lost sales from customers who
        opened the form but then closed it.
      </>
    ),
    buttonLabel: "Configure Downsells",
    imageSrc: "/images/upsellsanddownsells/downsell.svg",
    imageAlt: "Downsells discount illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
];

const OFFERS_BUNDLES_FEATURES: UpsellFeatureItem[] = [
  {
    id: "quantity-offers",
    icon: CartDiscountIcon,
    title: "Quantity Offers",
    description: (
      <>
        <strong>Quantity offers</strong> incentivize customers to buy more by unlocking discounts
        when they add multiple items to their order. Create tiered pricing rules — the more they
        buy, the <strong>better the deal</strong>. A proven way to increase average order value.
      </>
    ),
    buttonLabel: "Configure Quantity Offers",
    imageSrc: "/images/offersandbundles/quantity-offers.svg",
    imageAlt: "Quantity offers discount illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
  {
    id: "bundles",
    icon: GiftCardIcon,
    title: "Bundles",
    description: (
      <>
        <strong>Bundles</strong> let you group complementary products together and offer them at
        a special combined price. Encourage customers to buy related items in one click —{" "}
        <strong>boosting revenue</strong> while delivering more value per order.
      </>
    ),
    buttonLabel: "Configure Bundles",
    imageSrc: "/images/offersandbundles/bundles.svg",
    imageAlt: "Bundles product grouping illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
];

const COMING_SOON_ILLUSTRATION =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

export function SalesBoosterPageContent(): ReactElement {
  const [activeTab, setActiveTab] = useState<SalesBoosterTab>("upsells-downsells");
  const [helpDismissed, setHelpDismissed] = useState(false);
  const [offersHelpDismissed, setOffersHelpDismissed] = useState(false);

  const handleTabChange = useCallback((tab: SalesBoosterTab): void => {
    setActiveTab(tab);
  }, []);

  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0]!;

  return (
    <Page title="Sales Booster">
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={3} gap="100">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  style={{
                    backgroundColor: isSelected ? "var(--p-color-bg-surface-secondary)" : undefined,
                    borderRadius: "var(--p-border-radius-150)",
                    fontWeight: isSelected ? "bold" : undefined,
                  }}
                >
                  <Button
                    icon={tab.icon}
                    variant="tertiary"
                    fullWidth
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.label}
                  </Button>
                </div>
              );
            })}
          </InlineGrid>
        </Box>

        {activeTab === "abandoned-cart" ? (
          <Card>
            <EmptyState
              image={COMING_SOON_ILLUSTRATION}
              imageContained
              heading={active.comingSoonHeading ?? ""}
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
        ) : (
          <div style={{ width: "65.5rem", maxWidth: "100%" }}>
            <BlockStack gap="400">
              {(activeTab === "upsells-downsells" ? UPSELL_FEATURES : OFFERS_BUNDLES_FEATURES).map((item) => (
                <Card key={item.id}>
                  <InlineStack
                    align="space-between"
                    blockAlign="center"
                    gap="600"
                    wrap={false}
                  >
                    <BlockStack gap="300" inlineAlign="start">
                      <InlineStack gap="200" align="start" blockAlign="center">
                        <Icon source={item.icon} />
                        <Text as="h2" variant="headingMd" fontWeight="semibold">
                          {item.title}
                        </Text>
                      </InlineStack>

                      <div style={{ fontSize: "var(--p-font-size-350)", lineHeight: "var(--p-font-line-height-500)", color: "var(--p-color-text-secondary)" }}>
                        {item.description}
                      </div>

                      <InlineStack gap="300" blockAlign="center">
                        <Button icon={item.icon} variant="primary">
                          {item.buttonLabel}
                        </Button>
                        <Button icon={PlayCircleIcon} variant="plain">
                          Watch demo
                        </Button>
                      </InlineStack>
                    </BlockStack>

                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      width={item.imageWidth}
                      height={item.imageHeight}
                      style={{
                        display: "block",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  </InlineStack>
                </Card>
              ))}

              {activeTab === "upsells-downsells" && !helpDismissed && (
                <Banner
                  title="Do you need help with the new Upsells?"
                  tone="info"
                  onDismiss={() => setHelpDismissed(true)}
                  action={{
                    content: "Contact us",
                    onAction: () => {},
                  }}
                >
                  <p>Contact us, our support agents will be happy to help you!</p>
                </Banner>
              )}

              {activeTab === "quantity-offers" && !offersHelpDismissed && (
                <Banner
                  title="Do you need help with Offers & Bundles?"
                  tone="info"
                  onDismiss={() => setOffersHelpDismissed(true)}
                  action={{
                    content: "Contact us",
                    onAction: () => {},
                  }}
                >
                  <p>Contact us, our support agents will be happy to help you!</p>
                </Banner>
              )}
            </BlockStack>
          </div>
        )}
      </BlockStack>
    </Page>
  );
}
