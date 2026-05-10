"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  Page,
  RadioButton,
  Text,
} from "@shopify/polaris";
import {
  AlertCircleIcon,
  ChatIcon,
  ClockIcon,
  CodeIcon,
  ConnectIcon,
  DataTableIcon,
  ExternalIcon,
  InfoIcon,
  SettingsIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

type FormPlacement = "whole-store" | "product-pages" | "cart-page";
type WhenOpened = "product-only" | "product-and-cart";

type DisableInState = {
  homePage: boolean;
  collectionPage: boolean;
  regularPage: boolean;
  searchResultPage: boolean;
  cartDrawer: boolean;
};

type RestrictState = {
  enableForProducts: boolean;
  disableForProducts: boolean;
  allowCountriesOnly: boolean;
  enableOrderEligibility: boolean;
};

type SettingsTab =
  | "visibility"
  | "general"
  | "pixels"
  | "google-sheets"
  | "partners";

type TabConfig = {
  id: SettingsTab;
  label: string;
  icon: IconSource;
};

const TABS: TabConfig[] = [
  { id: "visibility", label: "Visibility", icon: ViewIcon },
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "pixels", label: "Pixels", icon: CodeIcon },
  { id: "google-sheets", label: "Google Sheets", icon: DataTableIcon },
  { id: "partners", label: "Partners & Integrations", icon: ConnectIcon },
];

const SHOPIFY_API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";
const EXTENSION_HANDLE = "cod-form";

function buildThemeEditorUrl(shopDomain: string): string {
  if (!shopDomain) return "";
  const storeName = shopDomain.replace(".myshopify.com", "");
  return `https://admin.shopify.com/store/${storeName}/themes/current/editor?context=apps&appEmbed=${SHOPIFY_API_KEY}%2F${EXTENSION_HANDLE}`;
}

const PLACEMENT_INFO: Record<FormPlacement, string> = {
  "whole-store": "The form will be displayed on all pages.",
  "product-pages":
    "The form will appear on product pages, other pages (except the cart page), and in the cart drawer.",
  "cart-page":
    "The form appears only on the cart page, not in the cart drawer or other pages.",
};

function StepNumber({ value }: { value: number }): ReactElement {
  return (
    <Box
      background="bg-fill-info"
      borderRadius="full"
      minWidth="24px"
      width="24px"
      minHeight="24px"
    >
      <Box paddingBlock="050">
        <InlineStack align="center" blockAlign="center">
          <Text
            as="span"
            variant="bodySm"
            fontWeight="semibold"
            tone="text-inverse"
          >
            {value}
          </Text>
        </InlineStack>
      </Box>
    </Box>
  );
}

function VisibilityTabContent(): ReactElement {
  const [themeEditorUrl, setThemeEditorUrl] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const [formPlacement, setFormPlacement] =
    useState<FormPlacement>("whole-store");
  const [hideCheckout, setHideCheckout] = useState(false);
  const [hideAddToCart, setHideAddToCart] = useState(false);
  const [hideBuyNow, setHideBuyNow] = useState(false);
  const [whenOpened, setWhenOpened] =
    useState<WhenOpened>("product-and-cart");
  const [disableIn, setDisableIn] = useState<DisableInState>({
    homePage: false,
    collectionPage: false,
    regularPage: false,
    searchResultPage: false,
    cartDrawer: false,
  });
  const [restrict, setRestrict] = useState<RestrictState>({
    enableForProducts: false,
    disableForProducts: false,
    allowCountriesOnly: false,
    enableOrderEligibility: false,
  });

  useEffect(() => {
    const domain: string =
      (
        window as Window & {
          shopify?: { config?: { shop?: string } };
        }
      ).shopify?.config?.shop ?? "";
    if (domain) setThemeEditorUrl(buildThemeEditorUrl(domain));
  }, []);

  const toggleDisableIn = useCallback(
    (key: keyof DisableInState, value: boolean): void => {
      setDisableIn((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleRestrict = useCallback(
    (key: keyof RestrictState, value: boolean): void => {
      setRestrict((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const isFullPlacement = formPlacement !== "cart-page";

  return (
    <BlockStack gap="800">
      {/* ── BuyEase Activation ───────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Visibility
          </Text>
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            BuyEase Activation
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Enable the BuyEase app embed in your active theme to start
            displaying the COD order form on your storefront.
          </Text>
        </BlockStack>

        <BlockStack gap="400">
          <Card padding="0">
            <Box padding="400">
              <BlockStack gap="500">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={AlertCircleIcon} tone="critical" />
                    <Text as="h3" variant="headingMd">
                      Start by enabling the app
                    </Text>
                  </InlineStack>
                  <Link url="#" removeUnderline>
                    Learn more
                  </Link>
                </InlineStack>

                <BlockStack gap="400">
                  <InlineStack gap="300" blockAlign="center" wrap={false}>
                    <StepNumber value={1} />
                    <Box>
                      <InlineStack gap="300" blockAlign="center" wrap={false}>
                        <Text as="p" variant="bodyMd">
                          First, open your theme by clicking this button:
                        </Text>
                        <Button
                          icon={ExternalIcon}
                          variant="primary"
                          url={themeEditorUrl || undefined}
                          target="_blank"
                          disabled={!themeEditorUrl}
                        >
                          Open theme
                        </Button>
                      </InlineStack>
                    </Box>
                  </InlineStack>

                  <InlineStack gap="300" blockAlign="start" wrap={false}>
                    <Box paddingBlockStart="050">
                      <StepNumber value={2} />
                    </Box>
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd">
                        In the theme editor, click the{" "}
                        <strong>Save</strong> button at the top-right corner.
                      </Text>
                      <Box
                        background="bg-surface-secondary"
                        borderRadius="200"
                        borderWidth="025"
                        borderColor="border"
                        padding="300"
                        overflowX="hidden"
                        overflowY="hidden"
                      >
                        <Image
                          src="/images/save-app-embed.png"
                          alt="Theme editor Save button location"
                          width={900}
                          height={460}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </BlockStack>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Box>

            <Divider />

            <Box padding="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                  Need help getting started? We&apos;re here for you.
                </Text>
                <Button icon={ChatIcon} variant="secondary">
                  Chat with us
                </Button>
              </InlineStack>
            </Box>
          </Card>

          {showBanner && (
            <Banner
              tone="info"
              onDismiss={() => setShowBanner(false)}
              action={{
                content: "How to enable the form on my store?",
                url: "#",
              }}
              secondaryAction={{ content: "Chat with us" }}
            >
              <Text as="p" variant="bodyMd">
                If you can&apos;t see the form in your store, or you need help
                to enable it, please contact us.
              </Text>
            </Banner>
          )}
        </BlockStack>
      </InlineGrid>

      <Divider />

      {/* ── Form Placement ───────────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Form placement
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Choose where you&apos;d like the form to be displayed. By default,
            it appears across the entire store, but you can restrict it to only
            show on the product page or cart page.
          </Text>
        </BlockStack>

        <Card padding="0">
          {/* Tab selector */}
          <Box padding="400">
            <ButtonGroup variant="segmented" fullWidth>
              <Button
                pressed={formPlacement === "whole-store"}
                onClick={() => setFormPlacement("whole-store")}
              >
                Whole store
              </Button>
              <Button
                pressed={formPlacement === "product-pages"}
                onClick={() => setFormPlacement("product-pages")}
              >
                Product pages only
              </Button>
              <Button
                pressed={formPlacement === "cart-page"}
                onClick={() => setFormPlacement("cart-page")}
              >
                Cart page only
              </Button>
            </ButtonGroup>
          </Box>

          {/* Placement info */}
          <Box
            background="bg-surface-info"
            paddingBlock="300"
            paddingInline="400"
          >
            <InlineStack gap="200" blockAlign="start">
              <Icon source={InfoIcon} tone="info" />
              <Text as="p" variant="bodyMd">
                {PLACEMENT_INFO[formPlacement]}
              </Text>
            </InlineStack>
          </Box>

          <Divider />

          {/* Button visibility + when opened / cart-page fallback */}
          <Box padding="400">
            {isFullPlacement ? (
              <BlockStack gap="400">
                <Checkbox
                  label={
                    <>
                      Hide <strong>Checkout</strong> button
                    </>
                  }
                  checked={hideCheckout}
                  onChange={setHideCheckout}
                />
                <Checkbox
                  label={
                    <>
                      Hide <strong>Add to Cart</strong> button
                    </>
                  }
                  checked={hideAddToCart}
                  onChange={setHideAddToCart}
                />
                <Checkbox
                  label={
                    <>
                      Hide <strong>Buy Now</strong> button
                    </>
                  }
                  checked={hideBuyNow}
                  onChange={setHideBuyNow}
                />

                <InlineStack gap="400" blockAlign="start" wrap={false}>
                  <Box minWidth="fit-content">
                    <Text as="p" variant="bodyMd">
                      When the form is opened:
                    </Text>
                  </Box>
                  <BlockStack gap="200">
                    <RadioButton
                      label="Buy only the product on page"
                      id="product-only"
                      name="whenOpened"
                      checked={whenOpened === "product-only"}
                      onChange={() => setWhenOpened("product-only")}
                    />
                    <RadioButton
                      label="Buy the product on page + items in cart"
                      id="product-and-cart"
                      name="whenOpened"
                      checked={whenOpened === "product-and-cart"}
                      onChange={() => setWhenOpened("product-and-cart")}
                    />
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            ) : (
              <Checkbox
                label={
                  <>
                    Hide <strong>Checkout</strong> button
                  </>
                }
                checked={hideCheckout}
                onChange={setHideCheckout}
              />
            )}
          </Box>

          {/* Disable form in — only for non-cart placements */}
          {isFullPlacement && (
            <>
              <Divider />
              <Box padding="400">
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Text as="p" variant="bodyMd">
                    Disable form in:
                  </Text>
                  <Checkbox
                    label="Home page"
                    checked={disableIn.homePage}
                    onChange={(v) => toggleDisableIn("homePage", v)}
                  />
                  <Checkbox
                    label="Collection page"
                    checked={disableIn.collectionPage}
                    onChange={(v) => toggleDisableIn("collectionPage", v)}
                  />
                  <Checkbox
                    label="Regular page"
                    checked={disableIn.regularPage}
                    onChange={(v) => toggleDisableIn("regularPage", v)}
                  />
                  <Checkbox
                    label="Search result page"
                    checked={disableIn.searchResultPage}
                    onChange={(v) => toggleDisableIn("searchResultPage", v)}
                  />
                  <Checkbox
                    label="Cart drawer"
                    checked={disableIn.cartDrawer}
                    onChange={(v) => toggleDisableIn("cartDrawer", v)}
                  />
                </InlineStack>
              </Box>
            </>
          )}
        </Card>
      </InlineGrid>

      <Divider />

      {/* ── Restrict Section ─────────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Restrict your order form to specific products, collections,
            countries, or order totals
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Choose to display your COD order form only for selected products and
            collections, specific countries, or based on the order total.
          </Text>
        </BlockStack>

        <Card padding="0">
          {/* Products & collections */}
          <Box padding="400">
            <BlockStack gap="300">
              <Checkbox
                label="Enable form only for specific products or collections"
                checked={restrict.enableForProducts}
                onChange={(v) => toggleRestrict("enableForProducts", v)}
              />
              <Checkbox
                label="Disable form for one or more products or collections"
                checked={restrict.disableForProducts}
                onChange={(v) => toggleRestrict("disableForProducts", v)}
              />
            </BlockStack>
          </Box>

          <Divider />

          {/* Countries */}
          <Box padding="400">
            <Checkbox
              label="Allow BuyEase form for the selected countries only"
              helpText="Enable the form for some countries only and use regular Shopify checkout for other countries."
              checked={restrict.allowCountriesOnly}
              onChange={(v) => toggleRestrict("allowCountriesOnly", v)}
            />
          </Box>

          <Divider />

          {/* Order eligibility */}
          <Box padding="400">
            <Checkbox
              label="Enable order eligibility"
              helpText="Orders with a total within these ranges will be eligible to pay with Cash on Delivery. Form will be disabled if order total is out of range."
              checked={restrict.enableOrderEligibility}
              onChange={(v) => toggleRestrict("enableOrderEligibility", v)}
            />
          </Box>
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}

function ComingSoon(): ReactElement {
  return (
    <Box paddingBlockStart="1600" paddingBlockEnd="1600">
      <BlockStack gap="400" align="center" inlineAlign="center">
        <Icon source={ClockIcon} tone="subdued" />
        <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
          Coming Soon
        </Text>
      </BlockStack>
    </Box>
  );
}

export function SettingsPageContent(): ReactElement {
  const [activeTab, setActiveTab] = useState<SettingsTab>("visibility");

  const handleTabChange = useCallback((tab: SettingsTab): void => {
    setActiveTab(tab);
  }, []);

  return (
    <Page title="Settings & Integrations">
      <BlockStack gap="400">
        <Box
          padding="100"
          background="bg-surface-secondary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <InlineGrid columns={5} gap="100">
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                icon={tab.icon}
                variant={activeTab === tab.id ? "primary" : "tertiary"}
                size="slim"
                fullWidth
                onClick={() => {
                  handleTabChange(tab.id);
                }}
              >
                {" " + tab.label}
              </Button>
            ))}
          </InlineGrid>
        </Box>

        {activeTab === "visibility" ? <VisibilityTabContent /> : <ComingSoon />}
      </BlockStack>
    </Page>
  );
}
