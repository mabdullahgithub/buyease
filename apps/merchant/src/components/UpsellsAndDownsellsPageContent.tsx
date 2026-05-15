"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Icon,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import {
  CartDownIcon,
  CartUpIcon,
  ChatIcon,
  ClipboardChecklistIcon,
} from "@shopify/polaris-icons";

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
    buttonLabel: "1-Click Upsells",
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
    buttonLabel: "1-Tick Upsells",
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
    buttonLabel: "Downsells",
    imageSrc: "/images/upsellsanddownsells/downsell.svg",
    imageAlt: "Downsells discount illustration",
    imageWidth: 100,
    imageHeight: 100,
  },
];

/**
 * Upsells & Downsells overview page.
 * Shown when the merchant clicks "Upsells & Downsells" in the sidebar.
 * Mirrors the Integrations & Messaging page layout exactly.
 */
export function UpsellsAndDownsellsPageContent(): ReactElement {
  const [helpDismissed, setHelpDismissed] = useState(false);

  return (
    <Page title="Upsells & Downsells">
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
        <BlockStack gap="400">
          {UPSELL_FEATURES.map((item) => (
            <Card key={item.id}>
              <InlineStack
                align="space-between"
                blockAlign="center"
                gap="600"
                wrap={false}
              >
                {/* Left: icon + title + description + button */}
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

                  <div>
                    <Button icon={item.icon} variant="primary">
                      {item.buttonLabel}
                    </Button>
                  </div>
                </BlockStack>

                {/* Right: illustration */}
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
          {!helpDismissed && (
            <Banner
              title="Do you need help with the new Upsells?"
              tone="info"
              onDismiss={() => setHelpDismissed(true)}
              action={{
                content: "Contact us",
                icon: ChatIcon,
                onAction: () => {},
              }}
            >
              <p>Contact us, our support agents will be happy to help you!</p>
            </Banner>
          )}
        </BlockStack>
      </div>
    </Page>
  );
}
