"use client";

import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  Icon,
  InlineStack,
  Layout,
  Link,
  Page,
  Text,
} from "@shopify/polaris";
import {
  ChartVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AppsIcon,
  ExternalIcon,
} from "@shopify/polaris-icons";
import Image from "next/image";
import { Suspense, useState } from "react";

export type HomeClientProps = {
  shop: string;
  ordersLast7Days: number;
  revenueLast7Days: number;
  conversionRateLast7Days: string;
  ordersThisMonth: number;
  totalOrders: number;
  planName: string;
  planOrderLimit: number;
};

const LEARN_MORE_URL = "https://buyease-landing.vercel.app";

const WHATS_NEW: Array<{
  id: string;
  date: string;
  badgeText: string;
  badgeTone: "success" | "info";
  dotColor: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  bullets: string[];
}> = [
  {
    id: "templates",
    date: "Mar 12, 2026",
    badgeText: "Latest",
    badgeTone: "success",
    dotColor: "#1f883d",
    title: "New: Form Templates",
    imageSrc: "/images/overview/templates.png",
    imageAlt: "Form templates preview card",
    bullets: [
      "30+ ready-made templates",
      "Every detail stays fully customizable after you apply a template",
      "Not just colors \u2014 Each template styles your fields, buttons and more",
    ],
  },
  {
    id: "partial-payment",
    date: "Feb 24, 2026",
    badgeText: "v2.10.0",
    badgeTone: "info",
    dotColor: "#8c8c8c",
    title: "New Feature: Partial Payment",
    imageSrc: "/images/overview/deposit.png",
    imageAlt: "Partial payment button styles preview",
    bullets: [
      "Cut failed deliveries \u2014 A small deposit filters out fake orders",
      "Flexible \u2014 Set a percentage or fixed deposit with custom labels",
      "Automated \u2014 Remaining balance is added to the order instantly",
    ],
  },
];

function TimelineDot({ color }: { color: string }): React.JSX.Element {
  return (
    <span
      style={{
        display: "inline-block",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}

function HomeClientInner({ shop }: HomeClientProps): React.JSX.Element {
  const [changelogOpen, setChangelogOpen] = useState(true);
  const openThemeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  return (
    <Page title="BuyEase COD Form">
      <Layout>
        {/* Analytics - Last 7 days */}
        <Layout.Section>
          <BlockStack gap="300">
            <InlineStack gap="100" blockAlign="center">
              <Icon source={ChartVerticalIcon} tone="subdued" />
              <Text as="h2" variant="headingSm" fontWeight="semibold">
                Analytics - Last 7 days
              </Text>
            </InlineStack>
            <Card>
              <Box paddingBlock="300">
                <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                  No data available yet
                </Text>
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* What's New */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  What&apos;s New
                </Text>
                <Button
                  variant="plain"
                  icon={changelogOpen ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setChangelogOpen((v) => !v)}
                  accessibilityLabel={changelogOpen ? "Collapse updates" : "Expand updates"}
                />
              </InlineStack>

              <Collapsible
                id="whats-new"
                open={changelogOpen}
                transition={{ duration: "150ms", timingFunction: "ease-out" }}
              >
                <BlockStack gap="400">
                  {WHATS_NEW.map((entry) => (
                    <BlockStack key={entry.id} gap="300">
                      <InlineStack gap="200" blockAlign="center">
                        <TimelineDot color={entry.dotColor} />
                        <Text as="span" variant="bodySm" tone="subdued">
                          {entry.date}
                        </Text>
                        <Badge tone={entry.badgeTone}>{entry.badgeText}</Badge>
                      </InlineStack>

                      <Card>
                        <InlineStack align="space-between" blockAlign="start" gap="400" wrap={false}>
                          <BlockStack gap="300">
                            <InlineStack gap="200" blockAlign="center">
                              <Text as="h3" variant="headingSm" fontWeight="semibold">
                                {entry.title}
                              </Text>
                              <Link url={LEARN_MORE_URL} target="_blank" removeUnderline>
                                Learn more
                              </Link>
                            </InlineStack>
                            <BlockStack gap="100">
                              {entry.bullets.map((bullet) => (
                                <Text as="p" variant="bodySm" key={`${entry.id}-${bullet.slice(0, 20)}`}>
                                  &bull; {bullet}
                                </Text>
                              ))}
                            </BlockStack>
                          </BlockStack>

                          <Box minWidth="180px">
                            <Image
                              src={entry.imageSrc}
                              alt={entry.imageAlt}
                              width={320}
                              height={160}
                              priority={entry.id === "templates"}
                              style={{
                                width: "180px",
                                height: "auto",
                                borderRadius: "10px",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        </InlineStack>
                      </Card>
                    </BlockStack>
                  ))}
                </BlockStack>
              </Collapsible>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Theme App Embed */}
        <Layout.Section>
          <Card>
            <BlockStack gap="100">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={AppsIcon} tone="subdued" />
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Theme App Embed
                  </Text>
                  <Badge tone="warning">Inactive</Badge>
                </InlineStack>

                <Button
                  variant="primary"
                  icon={ExternalIcon}
                  url={openThemeEditorUrl}
                  target="_blank"
                >
                  Open theme
                </Button>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                Form will not be visible when app embed is inactive
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function HomeClient(props: HomeClientProps): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <HomeClientInner {...props} />
    </Suspense>
  );
}
