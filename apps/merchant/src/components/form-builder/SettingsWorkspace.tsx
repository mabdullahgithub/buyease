"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  List,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  AlertCircleIcon,
  ChatIcon,
  CheckCircleIcon,
  ExternalIcon,
  InfoIcon,
} from "@shopify/polaris-icons";

type FormPlacement = "whole-store" | "product-pages" | "cart-page";
type WhenOpened = "product-only" | "product-and-cart";

type PlacementConfig = {
  value: FormPlacement;
  label: string;
};

const PLACEMENTS: PlacementConfig[] = [
  { value: "whole-store", label: "Whole store" },
  { value: "product-pages", label: "Product pages" },
  { value: "cart-page", label: "Cart page only" },
];

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

type DisableInKey = keyof DisableInState;

const SHOPIFY_API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";
const EXTENSION_HANDLE = "cod-form";

function buildThemeEditorUrl(shopDomain: string): string {
  if (!shopDomain) return "";
  const storeName = shopDomain.replace(".myshopify.com", "");
  return `https://admin.shopify.com/store/${storeName}/themes/current/editor?context=apps&appEmbed=${SHOPIFY_API_KEY}%2F${EXTENSION_HANDLE}`;
}

const PLACEMENT_INFO: Record<FormPlacement, { title: string; description: string }> = {
  "whole-store": {
    title: "Whole store",
    description:
      "The COD buy button appears on every page — product pages, home, collections, the cart page, and the cart drawer.",
  },
  "product-pages": {
    title: "Product pages",
    description:
      "The buy button appears only on product pages and in the cart drawer. It is hidden on the home page, collection pages, and the cart page.",
  },
  "cart-page": {
    title: "Cart page only",
    description:
      "The buy button appears only on the cart page. It is hidden everywhere else, including the cart drawer.",
  },
};

const DISABLE_IN_CHOICES: { label: string; value: DisableInKey }[] = [
  { label: "Home page", value: "homePage" },
  { label: "Collection page", value: "collectionPage" },
  { label: "Regular page", value: "regularPage" },
  { label: "Search result page", value: "searchResultPage" },
  { label: "Cart drawer", value: "cartDrawer" },
];

type Props = {
  embedEnabled?: boolean | null;
};

export function SettingsWorkspace({ embedEnabled }: Props): ReactElement {
  const [themeEditorUrl, setThemeEditorUrl] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [formPlacement, setFormPlacement] = useState<FormPlacement>("whole-store");
  const [hideCheckout, setHideCheckout] = useState(false);
  const [hideAddToCart, setHideAddToCart] = useState(false);
  const [hideBuyNow, setHideBuyNow] = useState(false);
  const [whenOpened, setWhenOpened] = useState<WhenOpened>("product-and-cart");
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
  const [hideSubmitButton, setHideSubmitButton] = useState(false);
  const [disableOutOfStock, setDisableOutOfStock] = useState(true);
  const [disableAllDiscounts, setDisableAllDiscounts] = useState(false);
  const [disableShopifyDiscount, setDisableShopifyDiscount] = useState(false);
  const [customCss, setCustomCss] = useState("");

  useEffect(() => {
    const domain: string =
      (window as Window & { shopify?: { config?: { shop?: string } } }).shopify?.config?.shop ?? "";
    if (domain) setThemeEditorUrl(buildThemeEditorUrl(domain));
  }, []);

  const toggleRestrict = useCallback(
    (key: keyof RestrictState, value: boolean): void => {
      setRestrict((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const isCartPage = formPlacement === "cart-page";
  const isWholeStore = formPlacement === "whole-store";

  return (
    <BlockStack gap="800">
      {/* ── BuyEase Activation ───────────────────────────────────────────── */}
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
          {embedEnabled ? (
            <Card padding="0">
              <Box padding="500">
                <BlockStack gap="400">
                  <InlineStack gap="300" blockAlign="center">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "var(--p-color-bg-fill-success)",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ color: "white" }}>
                        <Icon source={CheckCircleIcon} />
                      </div>
                    </div>
                    <BlockStack gap="050">
                      <Text as="h3" variant="headingMd">
                        Form is active on your storefront
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Customers can now place COD orders through your form.
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <Divider />

                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Want to adjust how the form appears in your theme?
                    </Text>
                    <Button
                      icon={ExternalIcon}
                      variant="secondary"
                      url={themeEditorUrl || undefined}
                      target="_blank"
                      disabled={!themeEditorUrl}
                    >
                      Open theme editor
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Box>
            </Card>
          ) : (
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

                  <List type="number" gap="loose">
                    <List.Item>
                      <BlockStack gap="200">
                        <Text as="span" variant="bodyMd">
                          First, open your theme by clicking this button.
                        </Text>
                        <InlineStack>
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
                      </BlockStack>
                    </List.Item>
                    <List.Item>
                      <BlockStack gap="300">
                        <Text as="span" variant="bodyMd">
                          In the theme editor, click the{" "}
                          <Text as="span" variant="bodyMd" fontWeight="semibold">
                            Save
                          </Text>{" "}
                          button at the top-right corner.
                        </Text>
                        <Box
                          borderRadius="200"
                          borderWidth="025"
                          borderColor="border"
                          overflowX="hidden"
                          overflowY="hidden"
                        >
                          <Image
                            src="/images/save-app-embed.png"
                            alt="Theme editor Save button location"
                            width={900}
                            height={460}
                            loading="eager"
                            style={{ width: "100%", height: "auto", display: "block" }}
                          />
                        </Box>
                      </BlockStack>
                    </List.Item>
                  </List>
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
          )}

          {embedEnabled ? (
            showBanner && (
              <Banner tone="info" onDismiss={() => setShowBanner(false)}>
                <Text as="p" variant="bodyMd">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">Tip: </Text>
                  Use the <Text as="span" variant="bodyMd" fontWeight="semibold">Form Designer</Text> tab to
                  customise colours, fields, and layout. Use <Text as="span" variant="bodyMd" fontWeight="semibold">Form Placement</Text> below
                  to control which pages and countries show the form.
                </Text>
              </Banner>
            )
          ) : (
            showBanner && (
              <Banner
                tone="info"
                onDismiss={() => setShowBanner(false)}
                action={{ content: "How to enable the form on my store?", url: "#" }}
                secondaryAction={{ content: "Chat with us" }}
              >
                <Text as="p" variant="bodyMd">
                  If you can&apos;t see the form in your store, or you need help
                  to enable it, please contact us.
                </Text>
              </Banner>
            )
          )}
        </BlockStack>
      </InlineGrid>

      <Divider />

      {/* ── Form Placement ───────────────────────────────────────────────── */}
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
          {/* Placement selector — matches the tab-switching pattern in FormBuilderPageContent */}
          <Box
            padding="100"
            background="bg-surface-secondary"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <InlineGrid columns={3} gap="100">
              {PLACEMENTS.map((p) => (
                <Button
                  key={p.value}
                  variant={formPlacement === p.value ? "primary" : "tertiary"}
                  fullWidth
                  onClick={() => setFormPlacement(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </InlineGrid>
          </Box>

          {/* Info banner describing current placement */}
          <Box background="bg-surface-info" paddingBlock="300" paddingInline="400">
            <InlineStack gap="200" blockAlign="start" wrap={false}>
              <Icon source={InfoIcon} tone="info" />
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {PLACEMENT_INFO[formPlacement].title}
                </Text>
                <Text as="p" variant="bodyMd">
                  {PLACEMENT_INFO[formPlacement].description}
                </Text>
              </BlockStack>
            </InlineStack>
          </Box>

          <Divider />

          {/* Options: whole-store and product-pages show full controls; cart-page is minimal */}
          {isCartPage ? (
            <Box padding="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Hide storefront buttons
                </Text>
                <Checkbox
                  label="Hide Checkout button"
                  checked={hideCheckout}
                  onChange={setHideCheckout}
                />
              </BlockStack>
            </Box>
          ) : (
            <>
              <Box padding="400">
                <BlockStack gap="500">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingSm">
                      Hide storefront buttons
                    </Text>
                    <BlockStack gap="200">
                      <Checkbox
                        label="Hide Checkout button"
                        checked={hideCheckout}
                        onChange={setHideCheckout}
                      />
                      <Checkbox
                        label="Hide Add to Cart button"
                        checked={hideAddToCart}
                        onChange={setHideAddToCart}
                      />
                      <Checkbox
                        label="Hide Buy Now button"
                        checked={hideBuyNow}
                        onChange={setHideBuyNow}
                      />
                    </BlockStack>
                  </BlockStack>

                  <ChoiceList
                    title="When the form is opened"
                    choices={[
                      {
                        label: "Buy only the product on page",
                        value: "product-only",
                      },
                      {
                        label: "Buy the product on page and items in cart",
                        value: "product-and-cart",
                      },
                    ]}
                    selected={[whenOpened]}
                    onChange={(values) => setWhenOpened(values[0] as WhenOpened)}
                  />
                </BlockStack>
              </Box>

              {/* "Disable form in" only applies to whole-store; product-pages is already page-specific */}
              {isWholeStore && (
                <>
                  <Divider />
                  <Box padding="400">
                    <ChoiceList
                      allowMultiple
                      title="Disable form in"
                      choices={DISABLE_IN_CHOICES}
                      selected={DISABLE_IN_CHOICES.filter((c) => disableIn[c.value]).map(
                        (c) => c.value,
                      )}
                      onChange={(values) =>
                        setDisableIn({
                          homePage: values.includes("homePage"),
                          collectionPage: values.includes("collectionPage"),
                          regularPage: values.includes("regularPage"),
                          searchResultPage: values.includes("searchResultPage"),
                          cartDrawer: values.includes("cartDrawer"),
                        })
                      }
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </Card>
      </InlineGrid>

      <Divider />

      {/* ── Restrict ─────────────────────────────────────────────────────── */}
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

          <Box padding="400">
            <Checkbox
              label="Allow BuyEase form for the selected countries only"
              helpText="Enable the form for some countries only and use regular Shopify checkout for other countries."
              checked={restrict.allowCountriesOnly}
              onChange={(v) => toggleRestrict("allowCountriesOnly", v)}
            />
          </Box>

          <Divider />

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

      <Divider />

      {/* ── Form Options ─────────────────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Form options
        </Text>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="200">
              <Checkbox
                label="Hide default form submit button (if prepaid button is enabled)"
                helpText="Caution: If enabled, you will not be able to accept Cash on Delivery orders."
                checked={hideSubmitButton}
                onChange={setHideSubmitButton}
              />
              <Checkbox
                label="Disable form for out of stock products"
                checked={disableOutOfStock}
                onChange={setDisableOutOfStock}
              />
              <Checkbox
                label="Disable all discounts on BuyEase Form"
                checked={disableAllDiscounts}
                onChange={setDisableAllDiscounts}
              />
              <Checkbox
                label="Disable Shopify automatic discount on BuyEase orders"
                checked={disableShopifyDiscount}
                onChange={setDisableShopifyDiscount}
              />
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* ── Custom Styles ────────────────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Custom Styles
        </Text>
        <Card padding="0">
          <Box padding="400">
            <TextField
              label="Custom CSS"
              labelHidden
              value={customCss}
              onChange={setCustomCss}
              multiline={5}
              maxLength={5000}
              showCharacterCount
              autoComplete="off"
              helpText="Add your custom CSS styles for the form"
            />
          </Box>
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}
