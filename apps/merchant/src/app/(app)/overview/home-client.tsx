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
  active: boolean;
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
    active: true,
    title: "New: Form Templates",
    imageSrc: "/images/overview/templates.png",
    imageAlt: "Form templates preview",
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
    active: false,
    title: "New Feature: Partial Payment",
    imageSrc: "/images/overview/deposit.png",
    imageAlt: "Partial payment preview",
    bullets: [
      "Cut failed deliveries \u2014 A small deposit filters out fake orders",
      "Flexible \u2014 Set a percentage or fixed deposit with custom labels",
      "Automated \u2014 Remaining balance is added to the order instantly",
    ],
  },
];

function HomeClientInner({ shop }: HomeClientProps): React.JSX.Element {
  const [changelogOpen, setChangelogOpen] = useState(true);
  const openThemeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  return (
    <>
      <style>{`
        @keyframes buyease-pulse {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(2.4); opacity: 0;    }
          100% { transform: scale(2.4); opacity: 0;    }
        }
        .buyease-dot-wrap {
          position: relative;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }
        .buyease-dot {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
        }
        .buyease-dot--active        { background: #1f883d; }
        .buyease-dot--inactive      { background: #b5b5b5; }
        .buyease-dot-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #1f883d;
          animation: buyease-pulse 1.8s ease-out infinite;
        }
        .buyease-timeline-line {
          position: absolute;
          left: 5px;
          top: 12px;
          height: calc(100% + 22px);
          width: 2px;
          background: #e1e3e5;
        }
        .buyease-inner-card {
          background: #f6f6f7;
          border: 1px solid #e1e3e5;
          border-radius: 12px;
          padding: 16px 20px;
        }
        .buyease-learn-more {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #005bd3;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          line-height: 20px;
          padding: 2px 6px;
          border-radius: 6px;
        }
        .buyease-learn-more:hover { background: #f0f6ff; }
        .buyease-learn-more svg  { width: 14px; height: 14px; fill: currentColor; }
        .buyease-analytics-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          width: 100%;
        }
        .buyease-theme-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
      `}</style>

      <Page>
        <Layout>
          {/* Analytics - Last 7 days */}
          <Layout.Section>
            <BlockStack gap="300">
              <div className="buyease-analytics-header">
                <Icon source={ChartVerticalIcon} tone="subdued" />
                <Text as="h2" variant="headingSm" fontWeight="semibold">
                  Analytics - Last 7 days
                </Text>
              </div>
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
                  <BlockStack gap="500">
                    {WHATS_NEW.map((entry, idx) => {
                      const isLast = idx === WHATS_NEW.length - 1;
                      return (
                        <div
                          key={entry.id}
                          style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}
                        >
                          {/* Timeline column */}
                          <div style={{ position: "relative", paddingTop: "4px" }}>
                            <div className="buyease-dot-wrap">
                              {entry.active ? (
                                <>
                                  <span className="buyease-dot-ring" />
                                  <span className="buyease-dot buyease-dot--active" />
                                </>
                              ) : (
                                <span className="buyease-dot buyease-dot--inactive" />
                              )}
                            </div>
                            {!isLast && <span className="buyease-timeline-line" />}
                          </div>

                          {/* Content column */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "10px",
                              }}
                            >
                              <Text as="span" variant="bodySm" tone="subdued">
                                {entry.date}
                              </Text>
                              <Badge tone={entry.badgeTone}>{entry.badgeText}</Badge>
                            </div>

                            <div className="buyease-inner-card">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "20px",
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                                      {entry.title}
                                    </Text>
                                    <a
                                      className="buyease-learn-more"
                                      href={LEARN_MORE_URL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <span>Learn more</span>
                                      <svg viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M11 3a1 1 0 0 0 0 2h2.59L8.3 10.29a1 1 0 1 0 1.41 1.42L15 6.41V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
                                        <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
                                      </svg>
                                    </a>
                                  </div>

                                  <ul
                                    style={{
                                      listStyle: "disc",
                                      paddingLeft: "20px",
                                      margin: 0,
                                      color: "#303030",
                                      fontSize: "13px",
                                      lineHeight: "20px",
                                    }}
                                  >
                                    {entry.bullets.map((bullet) => (
                                      <li key={`${entry.id}-${bullet.slice(0, 24)}`}>{bullet}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div style={{ flexShrink: 0 }}>
                                  <Image
                                    src={entry.imageSrc}
                                    alt={entry.imageAlt}
                                    width={440}
                                    height={220}
                                    priority={entry.active}
                                    style={{
                                      width: "240px",
                                      height: "auto",
                                      borderRadius: "12px",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </BlockStack>
                </Collapsible>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Theme App Embed */}
          <Layout.Section>
            <Card>
              <div className="buyease-theme-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <Icon source={AppsIcon} tone="subdued" />
                    <Text as="h2" variant="headingMd" fontWeight="semibold">
                      Theme App Embed
                    </Text>
                    <Badge tone="warning">Inactive</Badge>
                  </div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Form will not be visible when app embed is inactive
                  </Text>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <Button
                    variant="primary"
                    icon={ExternalIcon}
                    url={openThemeEditorUrl}
                    target="_blank"
                  >
                    Open theme
                  </Button>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}

export function HomeClient(props: HomeClientProps): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <HomeClientInner {...props} />
    </Suspense>
  );
}
