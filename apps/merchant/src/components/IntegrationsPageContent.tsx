"use client";

import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
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
import {
  ChatIcon,
  DataTableIcon,
  LocationIcon,
} from "@shopify/polaris-icons";

type IntegrationItem = {
  id: string;
  icon: IconSource;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "sms-whatsapp",
    icon: ChatIcon,
    title: "SMS & WhatsApp Messages",
    description:
      "Send personalized order confirmations, abandoned cart reminders and verify customer phone numbers using SMS or WhatsApp.",
    buttonLabel: "SMS & WhatsApp Messages",
    href: "/settings?tab=whatsapp",
    imageSrc: "/images/messaging.png",
    imageAlt: "SMS and WhatsApp messaging illustration",
    imageWidth: 80,
    imageHeight: 80,
  },
  {
    id: "google-sheets",
    icon: DataTableIcon,
    title: "Google Sheets",
    description:
      "Connect your form to Google Sheets to save all orders data in a spreadsheet",
    buttonLabel: "Google Sheets",
    href: "/settings?tab=google-sheets",
    imageSrc: "/images/sheet.svg",
    imageAlt: "Google Sheets icon",
    imageWidth: 80,
    imageHeight: 80,
  },
  {
    id: "google-autocomplete",
    icon: LocationIcon,
    title: "Google Address Autocomplete",
    description:
      "Use Google Autocomplete on your COD form to improve address accuracy and boost conversion rates.",
    buttonLabel: "Google Autocomplete",
    href: "/settings?tab=general",
    imageSrc: "/images/maps.svg",
    imageAlt: "Google Maps location pin",
    imageWidth: 80,
    imageHeight: 80,
  },
];

export function IntegrationsPageContent(): ReactElement {
  return (
    <Page title="Integrations & Messaging">
      <BlockStack gap="400">
        {INTEGRATIONS.map((item) => (
          <Card key={item.id}>
            <InlineStack align="space-between" blockAlign="center" gap="600" wrap={false}>
              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Icon source={item.icon} />
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    {item.title}
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {item.description}
                </Text>
                <div>
                  <Button icon={item.icon} url={item.href} variant="primary">
                    {item.buttonLabel}
                  </Button>
                </div>
              </BlockStack>
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                width={item.imageWidth}
                height={item.imageHeight}
                style={{ display: "block", objectFit: "contain", flexShrink: 0 }}
              />
            </InlineStack>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}
