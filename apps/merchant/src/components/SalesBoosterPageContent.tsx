"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactElement, SVGProps } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineGrid,
  InlineStack,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  CartAbandonedIcon,
  CartDiscountIcon,
  CartDownIcon,
  CartUpIcon,
  ClipboardChecklistIcon,
  EditIcon,
  GiftCardIcon,
  PlayCircleIcon,
} from "@shopify/polaris-icons";

type SalesBoosterTab = "upsells-downsells" | "quantity-offers" | "abandoned-cart";

type TabConfig = {
  id: SalesBoosterTab;
  label: string;
  icon: IconSource;
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

type AbandonedCartFeature = {
  title: string;
  description: string;
};

type PricingFeature = {
  title: string;
  description: string;
};

type CountryPricing = {
  sms: string;
  whatsapp: string;
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

const TOP_UP_AMOUNTS = [5, 10, 20, 50, 100, 250, 500] as const;

const CHANNEL_OPTIONS = [
  { label: "WhatsApp", value: "whatsapp" },
  { label: "SMS", value: "sms" },
];

const COUNTRY_OPTIONS = [
  { label: "Colombia", value: "CO" },
  { label: "United States", value: "US" },
  { label: "Mexico", value: "MX" },
  { label: "Brazil", value: "BR" },
  { label: "Argentina", value: "AR" },
  { label: "Chile", value: "CL" },
  { label: "Peru", value: "PE" },
  { label: "Spain", value: "ES" },
  { label: "United Kingdom", value: "GB" },
  { label: "Canada", value: "CA" },
];

const COUNTRY_PRICING: Record<string, CountryPricing> = {
  CO: { sms: "$0.0802", whatsapp: "$0.0425" },
  US: { sms: "$0.0079", whatsapp: "$0.0065" },
  MX: { sms: "$0.0278", whatsapp: "$0.0175" },
  BR: { sms: "$0.0310", whatsapp: "$0.0165" },
  AR: { sms: "$0.0428", whatsapp: "$0.0250" },
  CL: { sms: "$0.0521", whatsapp: "$0.0285" },
  PE: { sms: "$0.0398", whatsapp: "$0.0215" },
  ES: { sms: "$0.0845", whatsapp: "$0.0480" },
  GB: { sms: "$0.0431", whatsapp: "$0.0255" },
  CA: { sms: "$0.0072", whatsapp: "$0.0059" },
};

const ABANDONED_CART_FEATURES: AbandonedCartFeature[] = [
  {
    title: "Automated Order Recovery",
    description:
      "Abandoned orders are saved on your Shopify store and can be re-engaged later with a recovery WhatsApp message.",
  },
  {
    title: "Timely Follow-Up",
    description:
      "A WhatsApp message is sent 15 minutes after an order is abandoned, prompting customers to complete their purchase while the intent is still fresh.",
  },
  {
    title: "Seamless Re-Engagement",
    description:
      "The recovery link directs customers back to the exact page where they left off, with their previous information prefilled for a smooth checkout experience.",
  },
  {
    title: "Flexible User Experience",
    description:
      "Choose whether the form automatically opens when the recovery link is clicked, tailoring the experience to your preference.",
  },
  {
    title: "Consent-Driven Communication",
    description:
      "Messages are sent only if customers have opted in for marketing communications, ensuring compliance and maintaining trust.",
  },
];

const PRICING_FEATURES: PricingFeature[] = [
  {
    title: "Cost-Effective",
    description: "You're charged only for messages successfully queued by the carrier",
  },
  {
    title: "Reliable Delivery",
    description: "We use premium phone numbers to ensure fast, spam-free communication.",
  },
  {
    title: "Transparent Pricing",
    description: "Competitive rates are available per country.",
  },
];

const WhatsAppSvgIcon = (_props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="12" style={{ fill: "#25D366" }} />
    <path
      style={{ fill: "white" }}
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </svg>
);

const VALID_TABS = new Set<SalesBoosterTab>(["upsells-downsells", "quantity-offers", "abandoned-cart"]);

function parseTab(value: string | null): SalesBoosterTab {
  if (value && VALID_TABS.has(value as SalesBoosterTab)) return value as SalesBoosterTab;
  return "upsells-downsells";
}

export function SalesBoosterPageContent(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const [helpDismissed, setHelpDismissed] = useState(false);
  const [offersHelpDismissed, setOffersHelpDismissed] = useState(false);
  const [creditsBannerDismissed, setCreditsBannerDismissed] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("whatsapp");
  const [selectedCountry, setSelectedCountry] = useState("CO");

  const handleTabChange = useCallback((tab: SalesBoosterTab): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  }, [router, searchParams]);

  const pricing = COUNTRY_PRICING[selectedCountry] ?? COUNTRY_PRICING["CO"]!;

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
                    backgroundColor: isSelected ? "var(--p-color-bg-surface-hover)" : undefined,
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
            <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
              {/* Left Panel: Account & Settings */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <BlockStack gap="400">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd">
                      Your account balance:
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      $1.00
                    </Text>
                  </BlockStack>

                  {!creditsBannerDismissed && (
                    <Banner tone="info" onDismiss={() => setCreditsBannerDismissed(true)}>
                      We have gifted you <strong>$1.00</strong> of free credits to try this new
                      feature for free!
                    </Banner>
                  )}

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      Top up your account:
                    </Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {TOP_UP_AMOUNTS.map((amount) => (
                        <Button key={amount} variant="secondary" size="slim" onClick={() => {}}>
                          {`+ $${amount}`}
                        </Button>
                      ))}
                    </div>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      You will receive a notification when your balance is low at
                    </Text>
                    <TextField
                      label="Notification email"
                      labelHidden
                      value="withabdullah88@gmail.com"
                      readOnly
                      autoComplete="off"
                    />
                    <InlineStack gap="200">
                      <Button icon={EditIcon} onClick={() => {}}>
                        Change your contacts
                      </Button>
                      <Button icon={WhatsAppSvgIcon as IconSource} onClick={() => {}}>
                        Add your WhatsApp
                      </Button>
                    </InlineStack>
                  </BlockStack>

                  <Select
                    label="Select a channel"
                    options={CHANNEL_OPTIONS}
                    value={selectedChannel}
                    onChange={(value: string) => setSelectedChannel(value)}
                    helpText="Choose how to send messages to your customers."
                  />
                </BlockStack>
              </div>

              {/* Vertical Divider */}
              <div
                style={{
                  width: "1px",
                  alignSelf: "stretch",
                  background: "var(--p-color-border)",
                  flexShrink: 0,
                }}
              />

              {/* Right Panel: How It Works & Pricing */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <BlockStack gap="500">
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingSm" fontWeight="bold">
                      How Does Abandoned Cart WhatsApp message Work?
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Our Abandoned Cart WhatsApp message feature automatically recovers incomplete
                      orders from your Shopify store by sending a custom WhatsApp message, helping
                      you win back lost sales.
                    </Text>
                    <BlockStack gap="150">
                      {ABANDONED_CART_FEATURES.map((feature) => (
                        <Text as="p" variant="bodySm" key={feature.title}>
                          • <strong>{feature.title}:</strong> {feature.description}
                        </Text>
                      ))}
                    </BlockStack>
                  </BlockStack>

                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd" fontWeight="bold">
                      Pricing Details
                    </Text>
                    <BlockStack gap="150">
                      {PRICING_FEATURES.map((feature) => (
                        <Text as="p" variant="bodyMd" key={feature.title}>
                          ✓ <strong>{feature.title}:</strong> {feature.description}
                        </Text>
                      ))}
                    </BlockStack>

                    <InlineStack align="start" gap="400" blockAlign="center">
                      <div style={{ minWidth: "160px" }}>
                        <Select
                          label="Country"
                          labelHidden
                          options={COUNTRY_OPTIONS}
                          value={selectedCountry}
                          onChange={(value: string) => setSelectedCountry(value)}
                        />
                      </div>
                      <BlockStack gap="050">
                        <Text as="p" variant="bodyMd">
                          <strong>{pricing.sms}</strong> / SMS
                        </Text>
                        <Text as="p" variant="bodyMd">
                          <strong>{pricing.whatsapp}</strong> / WhatsApp message
                        </Text>
                      </BlockStack>
                    </InlineStack>

                    <Text as="p" variant="bodyMd" tone="subdued">
                      Boost your recovery rate, reduce cart abandonment friction, and turn missed
                      opportunities into completed orders with this smart, automated solution.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ width: "65.5rem", maxWidth: "100%" }}>
            <BlockStack gap="400">
              {(activeTab === "upsells-downsells" ? UPSELL_FEATURES : OFFERS_BUNDLES_FEATURES).map(
                (item) => (
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
                ),
              )}

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
