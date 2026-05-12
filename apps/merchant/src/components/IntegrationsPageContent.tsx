"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  Icon,
  InlineStack,
  Link,
  List,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  CashDollarFilledIcon,
  ChartVerticalIcon,
  ChatIcon,
  ChevronDownIcon,
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

type ActiveView = "list" | "sms-whatsapp";

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

const SMS_SERVICES = [
  {
    id: "otp",
    title: "Phone number Verification (OTP)",
    description:
      "Verify your customers phone numbers using a verification code. Avoid false orders and reduce delivery problems!",
  },
  {
    id: "order-confirmation",
    title: "Order confirmation Message",
    description:
      "Send a personalized order confirmation message to your customers.",
  },
  {
    id: "shipping-confirmation",
    title: "Shipping Confirmation Message",
    description:
      "Inform your customers by SMS or WhatsApp when you ship their order.",
  },
  {
    id: "abandoned-cart",
    title: "Abandoned Cart Recovery",
    description:
      "Automatically recover your abandoned orders from the COD form with a personalized message.",
  },
];

const SMS_PRICING_ROWS = [
  { label: "Phone Number Verification", price: "$0.0207" },
  { label: "Order / Shipping Confirmation", price: "$0.0207" },
  { label: "Abandoned Cart Recovery", price: "$0.0207" },
];

const WHATSAPP_PRICING_ROWS = [
  { label: "Phone Number Verification", price: "$0.0350" },
  { label: "Order / Shipping Confirmation", price: "$0.0320" },
  { label: "Abandoned Cart Recovery", price: "$0.0320" },
];

type Channel = "sms" | "whatsapp";

function SmsWhatsAppPage({ onBack }: { onBack: () => void }): ReactElement {
  const [topUpAmount, setTopUpAmount] = useState("5.00");
  const [channel, setChannel] = useState<Channel>("sms");

  const numericAmount = parseFloat(topUpAmount);
  const buttonLabel =
    !isNaN(numericAmount) && numericAmount > 0
      ? `Top up $${numericAmount.toFixed(2)}`
      : "Top up";

  const pricingRows =
    channel === "whatsapp" ? WHATSAPP_PRICING_ROWS : SMS_PRICING_ROWS;
  const pricingTitle =
    channel === "whatsapp" ? "Pricing - WhatsApp" : "Pricing - SMS";

  return (
    <Page
      backAction={{ content: "Integrations", onAction: onBack }}
      title="SMS & WhatsApp Messages"
    >
      <BlockStack gap="400">
        {/* Left: Balance + Channel | Right: Pricing */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--p-space-400)",
            alignItems: "stretch",
          }}
        >
          {/* Left column */}
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400" inlineAlign="center">
                <BlockStack gap="200" inlineAlign="center">
                  <Text
                    as="h2"
                    variant="headingLg"
                    fontWeight="semibold"
                    alignment="center"
                  >
                    Remaining balance
                  </Text>
                  <Text as="p" variant="heading2xl" alignment="center">
                    $1.000
                  </Text>
                </BlockStack>
                <Box paddingBlockStart="200" paddingBlockEnd="200" width="100%">
                  <Divider />
                </Box>
                <BlockStack gap="300" inlineAlign="center">
                  <Text
                    as="p"
                    variant="headingMd"
                    fontWeight="semibold"
                    alignment="center"
                  >
                    Top up your balance
                  </Text>
                  <div style={{ width: "180px" }}>
                    <TextField
                      label="Top-up amount"
                      labelHidden
                      value={topUpAmount}
                      prefix={<Icon source={CashDollarFilledIcon} />}
                      type="number"
                      min={0}
                      step={0.01}
                      autoComplete="off"
                      onChange={(value) => setTopUpAmount(value)}
                    />
                  </div>
                  <Button variant="primary">{buttonLabel}</Button>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Select how you would like to message your customers:
                </Text>
                <Select
                  label="Channel"
                  labelInline
                  options={[
                    { label: "SMS", value: "sms" },
                    { label: "WhatsApp", value: "whatsapp" },
                  ]}
                  value={channel}
                  onChange={(value) => setChannel(value as Channel)}
                />
              </BlockStack>
            </Card>
          </BlockStack>

          {/* Right column — Pricing, stretches to match left column height */}
          <div
            style={{
              height: "100%",
              backgroundColor: "var(--p-color-bg-surface)",
              borderRadius: "var(--p-border-radius-300)",
              boxShadow: "var(--p-shadow-100)",
              padding: "var(--p-space-400)",
              boxSizing: "border-box",
            }}
          >
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                {pricingTitle}
              </Text>
              <Select
                label="Select country"
                labelInline
                options={[{ label: "United States", value: "us" }]}
                value="us"
                onChange={() => {}}
              />
              <Divider />
              <BlockStack gap="200">
                {pricingRows.map((row) => (
                  <InlineStack key={row.label} align="space-between">
                    <Text as="span" variant="bodyMd">
                      {row.label}
                    </Text>
                    <Text as="span" variant="bodyMd">
                      {row.price}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
              <Divider />
              <List>
                <List.Item>
                  <strong>Cost-Effective:</strong> Pay only for messages that
                  are successfully queued by the carrier.
                </List.Item>
                <List.Item>
                  <strong>Reliable Delivery:</strong> Our premium phone numbers
                  ensure fast, secure, and spam-free communication.
                </List.Item>
                <List.Item>
                  <strong>Transparent Pricing:</strong> Enjoy competitive,
                  country-specific rates with no hidden fees.
                </List.Item>
              </List>
            </BlockStack>
          </div>
        </div>

        {SMS_SERVICES.map((service) => (
          <Card key={service.id}>
            <BlockStack gap="300">
              <InlineStack
                align="space-between"
                blockAlign="start"
                wrap={false}
                gap="400"
              >
                <BlockStack gap="100" inlineAlign="start">
                  <InlineStack
                    gap="200"
                    blockAlign="center"
                    align="start"
                    wrap={false}
                  >
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {service.title}
                    </Text>
                    <Text
                      as="span"
                      variant="bodyMd"
                      tone="caution"
                      fontWeight="bold"
                    >
                      Deactivated
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {service.description}
                  </Text>
                </BlockStack>
                <InlineStack gap="200" blockAlign="center">
                  <Button variant="primary">Activate</Button>
                  <Button icon={ChevronDownIcon}>Personalize</Button>
                </InlineStack>
              </InlineStack>
              <Divider />
              <InlineStack
                gap="200"
                blockAlign="center"
                align="start"
                wrap={false}
              >
                <div style={{ flexShrink: 0, display: "flex" }}>
                  <Icon source={ChartVerticalIcon} tone="subdued" />
                </div>
                <Text as="p" variant="bodySm" tone="subdued">
                  Last 30 days: Data not available yet. Check back after sending
                  the first message
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        ))}

        <Card>
          <TextField
            label="Store name for Messages"
            value="Product Store"
            helpText="This will be used in the message as the store name."
            autoComplete="off"
            onChange={() => {}}
          />
        </Card>

        <InlineStack align="center">
          <Text as="p" variant="bodyMd">
            Learn more about{" "}
            <Link url="#" target="_blank">
              SMS & WhatsApp Messages
            </Link>
          </Text>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}

export function IntegrationsPageContent(): ReactElement {
  const [activeView, setActiveView] = useState<ActiveView>("list");

  if (activeView === "sms-whatsapp") {
    return <SmsWhatsAppPage onBack={() => setActiveView("list")} />;
  }

  return (
    <Page title="Integrations & Messaging">
      <BlockStack gap="400">
        {INTEGRATIONS.map((item) => (
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
                <Text as="p" variant="bodyMd" tone="subdued">
                  {item.description}
                </Text>
                <div>
                  {item.id === "sms-whatsapp" ? (
                    <Button
                      icon={item.icon}
                      variant="primary"
                      onClick={() => setActiveView("sms-whatsapp")}
                    >
                      {item.buttonLabel}
                    </Button>
                  ) : (
                    <Button icon={item.icon} url={item.href} variant="primary">
                      {item.buttonLabel}
                    </Button>
                  )}
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
    </Page>
  );
}
