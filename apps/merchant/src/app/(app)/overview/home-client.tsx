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
import { ChartVerticalIcon, ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
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

const WHATS_NEW: Array<{
  id: string;
  date: string;
  badgeText: string;
  badgeTone: "success" | "info";
  title: string;
  imageSrc: string;
  imageAlt: string;
  learnMoreUrl: string;
  bullets: string[];
}> = [
  {
    id: "templates",
    date: "Mar 12, 2026",
    badgeText: "Latest",
    badgeTone: "success",
    title: "New: Form Templates",
    imageSrc: "/images/overview/templates.png",
    imageAlt: "Form templates preview card",
    learnMoreUrl: "https://buyease.app/changelog/form-templates",
    bullets: [
      "30+ ready-made templates",
      "Every detail stays fully customizable after you apply a template",
      "Not just colors - Each template styles your fields, buttons and more",
    ],
  },
  {
    id: "partial-payment",
    date: "Feb 24, 2026",
    badgeText: "v2.10.0",
    badgeTone: "info",
    title: "New Feature: Partial Payment",
    imageSrc: "/images/overview/deposit.png",
    imageAlt: "Partial payment button styles preview",
    learnMoreUrl: "https://buyease.app/changelog/partial-payment",
    bullets: [
      "Cut failed deliveries - A small deposit filters out fake orders",
      "Flexible - Set a percentage or fixed deposit with custom labels",
      "Automated - Remaining balance is added to the order instantly",
    ],
  },
];

function HomeClientInner({ shop }: HomeClientProps): React.JSX.Element {
  const [changelogOpen, setChangelogOpen] = useState(true);
  const openThemeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  return (
    <Page title="BuyEase COD Form">
      <Layout>
        <Layout.Section>
          <BlockStack gap="300">
            <InlineStack gap="100" blockAlign="center">
              <Icon source={ChartVerticalIcon} tone="subdued" />
              <Text as="h2" variant="headingSm">
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
                  onClick={() => setChangelogOpen((value) => !value)}
                  accessibilityLabel={changelogOpen ? "Collapse updates" : "Expand updates"}
                />
              </InlineStack>

              <Collapsible
                id="whats-new"
                open={changelogOpen}
                transition={{ duration: "150ms", timingFunction: "ease-out" }}
              >
                <BlockStack gap="300">
                  {WHATS_NEW.map((entry) => (
                    <Card key={entry.id}>
                      <BlockStack gap="300">
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="span" variant="bodySm" tone="subdued">
                            {entry.date}
                          </Text>
                          <Badge tone={entry.badgeTone}>{entry.badgeText}</Badge>
                        </InlineStack>

                        <InlineStack align="space-between" blockAlign="start" gap="400">
                          <BlockStack gap="200">
                            <InlineStack gap="200" blockAlign="center">
                              <Text as="h3" variant="headingSm">
                                {entry.title}
                              </Text>
                              <Link url={entry.learnMoreUrl} removeUnderline>
                                Learn more
                              </Link>
                            </InlineStack>
                            <BlockStack gap="100">
                              {entry.bullets.map((bullet) => (
                                <Text as="p" variant="bodySm" key={`${entry.id}-${bullet}`}>
                                  - {bullet}
                                </Text>
                              ))}
                            </BlockStack>
                          </BlockStack>

                          <Box minWidth="220px">
                            <Image
                              src={entry.imageSrc}
                              alt={entry.imageAlt}
                              width={320}
                              height={160}
                              priority={entry.id === "templates"}
                              style={{
                                width: "220px",
                                height: "auto",
                                borderRadius: "12px",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        </InlineStack>
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              </Collapsible>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Theme App Embed
                </Text>
                <Badge tone="attention">Inactive</Badge>
              </InlineStack>

              <Button variant="primary" url={openThemeEditorUrl} target="_blank">
                Open theme
              </Button>
            </InlineStack>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodySm" tone="subdued">
                Form will not be visible when app embed is inactive
              </Text>
            </Box>
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
