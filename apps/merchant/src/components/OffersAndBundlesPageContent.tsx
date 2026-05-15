"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import {
  BlockStack,
  Button,
  Card,
  Icon,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { CartDiscountIcon, GiftCardIcon } from "@shopify/polaris-icons";

type OfferFeatureItem = {
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

const OFFER_FEATURES: OfferFeatureItem[] = [
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
    buttonLabel: "Quantity Offers",
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
    buttonLabel: "Bundles",
    imageSrc: "/images/offersandbundles/bundles.svg",
    imageAlt: "Bundles product grouping illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
];

export function OffersAndBundlesPageContent(): ReactElement {
  return (
    <Page title="Offers & Bundles">
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
        <BlockStack gap="400">
          {OFFER_FEATURES.map((item) => (
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

                  <div
                    style={{
                      fontSize: "var(--p-font-size-350)",
                      lineHeight: "var(--p-font-line-height-500)",
                      color: "var(--p-color-text-secondary)",
                    }}
                  >
                    {item.description}
                  </div>

                  <div>
                    <Button icon={item.icon} variant="primary">
                      {item.buttonLabel}
                    </Button>
                  </div>
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
        </BlockStack>
      </div>
    </Page>
  );
}
