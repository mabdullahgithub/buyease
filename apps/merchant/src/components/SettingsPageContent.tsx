"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";
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
  ChoiceList,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  List,
  Page,
  Select,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  AlertCircleIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CodeIcon,
  CollectionReferenceIcon,
  ConnectIcon,
  DataTableIcon,
  DeleteIcon,
  ExternalIcon,
  InfoIcon,
  PlusIcon,
  ProductIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  ViewIcon,
  XSmallIcon,
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
  | "whatsapp";

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
  { id: "whatsapp", label: "WhatsApp", icon: ChatIcon },
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

type DisableInKey = keyof DisableInState;

const DISABLE_IN_CHOICES: { label: string; value: DisableInKey }[] = [
  { label: "Home page", value: "homePage" },
  { label: "Collection page", value: "collectionPage" },
  { label: "Regular page", value: "regularPage" },
  { label: "Search result page", value: "searchResultPage" },
  { label: "Cart drawer", value: "cartDrawer" },
];

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
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
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
            <InlineStack gap="200" blockAlign="start" wrap={false}>
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
                  onChange={(values) =>
                    setWhenOpened(values[0] as WhenOpened)
                  }
                />
              </BlockStack>
            ) : (
              <Checkbox
                label="Hide Checkout button"
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
                <ChoiceList
                  allowMultiple
                  title="Disable form in"
                  choices={DISABLE_IN_CHOICES}
                  selected={DISABLE_IN_CHOICES.filter(
                    (c) => disableIn[c.value],
                  ).map((c) => c.value)}
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

type TaxRate = {
  id: string;
  name: string;
  rate: string;
  chargeTaxOnShipping: boolean;
  shippingRate: string;
  includeTaxesInPrice: boolean;
  countriesSearch: string;
};

type DiscountType = "no-discount" | "fixed-amount" | "percentage";

type CodFeeType = "fixed" | "percentage";

type RedirectionMode =
  | "shopify-thank-you"
  | "specific-page"
  | "whatsapp"
  | "no-redirection";

const VARIABLES_GRID: string[][] = [
  ["{{customer.name}}", "{{customer.city}}", "{{order.shipping_method}}"],
  ["{{customer.phone}}", "{{customer.zip}}", "{{order.products}}"],
  ["{{customer.email}}", "{{order.id}}", "{{order.variants}}"],
  ["{{customer.address1}}", "{{order.number}}", "{{order.quantity}}"],
  ["{{customer.address2}}", "{{order.total}}", "{{order.variant_ids}}"],
  ["{{customer.province}}", "{{order.note}}", "{{order.products_urls}}"],
];


function VariablesSection(): ReactElement {
  const [open, setOpen] = useState(true);

  return (
    <BlockStack gap="300">
      <InlineStack>
        <Button
          variant="plain"
          icon={open ? ChevronUpIcon : ChevronDownIcon}
          onClick={() => setOpen(!open)}
        >
          Variables:
        </Button>
      </InlineStack>
      {open && (
        <InlineGrid columns={3} gap="200">
          {VARIABLES_GRID.flat().map((variable) => (
            <button
              key={variable}
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(variable);
              }}
              style={{
                background: "none",
                border: "none",
                padding: "2px 0",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "13px",
                color: "#303030",
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {variable}
            </button>
          ))}
        </InlineGrid>
      )}
    </BlockStack>
  );
}


function GeneralTabContent(): ReactElement {
  const [redirection, setRedirection] =
    useState<RedirectionMode>("shopify-thank-you");
  const [specificPageUrl, setSpecificPageUrl] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [codFee, setCodFee] = useState(false);
  const [codFeeType, setCodFeeType] = useState<CodFeeType>("fixed");
  const [codFeeAmount, setCodFeeAmount] = useState("0");
  const [codFeeName, setCodFeeName] = useState("");
  const [codFeeSku, setCodFeeSku] = useState("");
  const [codChargeTax, setCodChargeTax] = useState(true);
  const [codRequiresShipping, setCodRequiresShipping] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: "1",
      name: "",
      rate: "0",
      chargeTaxOnShipping: false,
      shippingRate: "0",
      includeTaxesInPrice: false,
      countriesSearch: "",
    },
  ]);
  const [abandonedCheckouts, setAbandonedCheckouts] = useState(false);
  const [abandonedCartDelay, setAbandonedCartDelay] = useState("15");
  const [abandonedBannerVisible, setAbandonedBannerVisible] = useState(true);
  const [autoOpenRecovery, setAutoOpenRecovery] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("no-discount");
  const [discountValue, setDiscountValue] = useState("0.00");

  const addTaxRate = useCallback((): void => {
    setTaxRates((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        rate: "0",
        chargeTaxOnShipping: false,
        shippingRate: "0",
        includeTaxesInPrice: false,
        countriesSearch: "",
      },
    ]);
  }, []);

  const updateTaxRate = useCallback(
    (id: string, field: keyof TaxRate, value: string | boolean): void => {
      setTaxRates((prev) =>
        prev.map((rate) =>
          rate.id === id ? ({ ...rate, [field]: value } as TaxRate) : rate
        )
      );
    },
    []
  );

  const removeTaxRate = useCallback((id: string): void => {
    setTaxRates((prev) => prev.filter((rate) => rate.id !== id));
  }, []);
  const [upsellSimultaneous, setUpsellSimultaneous] = useState(false);
  const [upsellSeparate, setUpsellSeparate] = useState(false);
  const [removeCountryCode, setRemoveCountryCode] = useState(false);
  const [createDraftOrders, setCreateDraftOrders] = useState(false);
  const [addCodTag, setAddCodTag] = useState(true);
  const [includeUtmParams, setIncludeUtmParams] = useState(true);
  const [hideSubmitButton, setHideSubmitButton] = useState(false);
  const [disableOutOfStock, setDisableOutOfStock] = useState(true);
  const [disableAllDiscounts, setDisableAllDiscounts] = useState(false);
  const [disableShopifyDiscount, setDisableShopifyDiscount] = useState(false);
  const [customCss, setCustomCss] = useState("");
  const [showTranslationBanner, setShowTranslationBanner] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <BlockStack gap="800">
      {/* 1. Manage redirection */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Manage redirection
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Select where you want to redirect customers after placing the order
          </Text>
        </BlockStack>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              <ChoiceList
                title="Redirection"
                titleHidden
                choices={[
                  {
                    label:
                      "Redirect customers to Shopify default Thank you page",
                    value: "shopify-thank-you",
                  },
                  {
                    label: "Redirect customers to specific page",
                    value: "specific-page",
                    renderChildren: (isSelected) =>
                      isSelected ? (
                        <Box paddingBlockStart="300">
                          <TextField
                            label="URL"
                            labelHidden
                            value={specificPageUrl}
                            onChange={setSpecificPageUrl}
                            placeholder="https://shopify.com"
                            helpText="Link where to redirect customers after submitting form."
                            autoComplete="off"
                          />
                        </Box>
                      ) : null,
                  },
                  {
                    label:
                      "Redirect customers to WhatsApp to chat with you",
                    value: "whatsapp",
                    renderChildren: (isSelected) =>
                      isSelected ? (
                        <Box paddingBlockStart="300">
                          <InlineGrid columns={2} gap="400">
                            <TextField
                              label="WhatsApp Message"
                              value={whatsappMessage}
                              onChange={setWhatsappMessage}
                              multiline={4}
                              autoComplete="off"
                            />
                            <TextField
                              label="Your WhatsApp phone number"
                              value={whatsappPhone}
                              onChange={setWhatsappPhone}
                              placeholder="+571234567890"
                              helpText="Please include the country code"
                              autoComplete="off"
                            />
                          </InlineGrid>
                        </Box>
                      ) : null,
                  },
                  {
                    label: "No redirection (Show thank you message only)",
                    value: "no-redirection",
                    renderChildren: (isSelected) =>
                      isSelected ? (
                        <Box paddingBlockStart="300">
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Message to show after submiting the form
                            </Text>
                            <RichTextEditor />
                          </BlockStack>
                        </Box>
                      ) : null,
                  },
                ]}
                selected={[redirection]}
                onChange={(values) =>
                  setRedirection(values[0] as RedirectionMode)
                }
              />
              {redirection !== "shopify-thank-you" && <VariablesSection />}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 2. Cash on Delivery fee */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Cash on Delivery fee
        </Text>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              <Checkbox
                label="Charge an additional fee on orders placed through the form"
                checked={codFee}
                onChange={setCodFee}
              />
              {codFee && (
                <BlockStack gap="400">
                  <InlineGrid columns={["twoThirds", "oneThird"]} gap="400">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button
                        pressed={codFeeType === "fixed"}
                        onClick={() => setCodFeeType("fixed")}
                      >
                        Fixed
                      </Button>
                      <Button
                        pressed={codFeeType === "percentage"}
                        onClick={() => setCodFeeType("percentage")}
                      >
                        Percentage
                      </Button>
                    </ButtonGroup>
                    <TextField
                      label="Amount"
                      labelHidden
                      value={codFeeAmount}
                      onChange={setCodFeeAmount}
                      prefix={codFeeType === "fixed" ? "USD" : undefined}
                      suffix={codFeeType === "percentage" ? "%" : undefined}
                      type="number"
                      autoComplete="off"
                    />
                  </InlineGrid>
                  <InlineGrid columns={2} gap="400">
                    <TextField
                      label="Fee name"
                      value={codFeeName}
                      onChange={setCodFeeName}
                      autoComplete="off"
                    />
                    <TextField
                      label="SKU"
                      value={codFeeSku}
                      onChange={setCodFeeSku}
                      autoComplete="off"
                    />
                  </InlineGrid>
                  <BlockStack gap="200">
                    <Checkbox
                      label="Charge tax"
                      checked={codChargeTax}
                      onChange={setCodChargeTax}
                    />
                    <Checkbox
                      label="Requires shipping"
                      checked={codRequiresShipping}
                      onChange={setCodRequiresShipping}
                    />
                  </BlockStack>
                </BlockStack>
              )}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 3. Enable Tax calculation */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Enable Tax calculation
        </Text>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Checkbox
                  label="Enable Tax calculation"
                  checked={taxCalculation}
                  onChange={setTaxCalculation}
                />
                {taxCalculation && (
                  <Button icon={PlusIcon} onClick={addTaxRate}>
                    Add New Tax Rate
                  </Button>
                )}
              </InlineStack>
              {taxCalculation &&
                taxRates.map((rate) => (
                  <Box
                    key={rate.id}
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    padding="0"
                  >
                    <Box padding="400">
                      <InlineGrid columns={2} gap="500">
                        {/* Left: fields */}
                        <BlockStack gap="300">
                          <InlineGrid columns={2} gap="300">
                            <TextField
                              label="Tax Name"
                              placeholder="e.g., VAT, Books VAT, et..."
                              value={rate.name}
                              onChange={(v) =>
                                updateTaxRate(rate.id, "name", v)
                              }
                              autoComplete="off"
                            />
                            <TextField
                              label="Tax rate (%)"
                              suffix="%"
                              value={rate.rate}
                              onChange={(v) =>
                                updateTaxRate(rate.id, "rate", v)
                              }
                              type="number"
                              autoComplete="off"
                            />
                          </InlineGrid>
                          <InlineGrid
                            columns={["twoThirds", "oneThird"]}
                            gap="300"
                          >
                            <Box paddingBlockStart="100">
                              <Checkbox
                                label="Charge tax on shipping"
                                checked={rate.chargeTaxOnShipping}
                                onChange={(v) =>
                                  updateTaxRate(
                                    rate.id,
                                    "chargeTaxOnShipping",
                                    v
                                  )
                                }
                              />
                            </Box>
                            <TextField
                              label=""
                              labelHidden
                              value={rate.shippingRate}
                              disabled={!rate.chargeTaxOnShipping}
                              onChange={(v) =>
                                updateTaxRate(rate.id, "shippingRate", v)
                              }
                              suffix="%"
                              type="number"
                              autoComplete="off"
                            />
                          </InlineGrid>
                          <Checkbox
                            label="Include taxes in price"
                            checked={rate.includeTaxesInPrice}
                            onChange={(v) =>
                              updateTaxRate(rate.id, "includeTaxesInPrice", v)
                            }
                          />
                        </BlockStack>

                        {/* Right: targeting + delete */}
                        <Box
                          borderInlineStartWidth="025"
                          borderColor="border"
                          paddingInlineStart="500"
                        >
                          <InlineStack
                            align="space-between"
                            blockAlign="start"
                            wrap={false}
                          >
                            <BlockStack gap="300">
                              <BlockStack gap="100">
                                <InlineStack gap="100" blockAlign="center">
                                  <Text as="span" tone="subdued">
                                    •
                                  </Text>
                                  <Text as="span" variant="bodyMd">
                                    Apply to specific countries
                                  </Text>
                                </InlineStack>
                                <TextField
                                  label=""
                                  labelHidden
                                  prefix={<Icon source={SearchIcon} />}
                                  placeholder="Select countries"
                                  value={rate.countriesSearch}
                                  onChange={(v) =>
                                    updateTaxRate(
                                      rate.id,
                                      "countriesSearch",
                                      v
                                    )
                                  }
                                  autoComplete="off"
                                />
                              </BlockStack>
                              <BlockStack gap="100">
                                <InlineStack gap="100" blockAlign="center">
                                  <Text as="span" tone="subdued">
                                    •
                                  </Text>
                                  <Text as="span" variant="bodyMd">
                                    Apply to specific products or collections
                                  </Text>
                                </InlineStack>
                                <InlineStack gap="200">
                                  <Button
                                    icon={ProductIcon}
                                    size="slim"
                                  >
                                    Select products
                                  </Button>
                                  <Button
                                    icon={CollectionReferenceIcon}
                                    size="slim"
                                  >
                                    Select collections
                                  </Button>
                                </InlineStack>
                              </BlockStack>
                            </BlockStack>
                            <Button
                              icon={DeleteIcon}
                              tone="critical"
                              variant="plain"
                              onClick={() => removeTaxRate(rate.id)}
                              accessibilityLabel="Delete tax rate"
                            />
                          </InlineStack>
                        </Box>
                      </InlineGrid>
                    </Box>
                  </Box>
                ))}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 4. Abandoned checkouts */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Abandoned checkouts
        </Text>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              <Checkbox
                label="Enable abandoned orders"
                checked={abandonedCheckouts}
                onChange={setAbandonedCheckouts}
              />
              {abandonedCheckouts && (
                <BlockStack gap="400">
                  {/* Delay picker — shown immediately when enabled */}
                  <Select
                    label="Send recovery message after"
                    helpText="Time after cart abandonment before draft order creation and recovery messages are triggered."
                    options={[
                      { label: "5 minutes", value: "5" },
                      { label: "10 minutes", value: "10" },
                      { label: "15 minutes (recommended)", value: "15" },
                      { label: "20 minutes", value: "20" },
                      { label: "30 minutes", value: "30" },
                      { label: "45 minutes", value: "45" },
                      { label: "1 hour", value: "60" },
                      { label: "2 hours", value: "120" },
                      { label: "4 hours", value: "240" },
                      { label: "6 hours", value: "360" },
                      { label: "12 hours", value: "720" },
                      { label: "24 hours", value: "1440" },
                      { label: "48 hours", value: "2880" },
                      { label: "7 days", value: "10080" },
                    ]}
                    value={abandonedCartDelay}
                    onChange={setAbandonedCartDelay}
                  />
                  {abandonedBannerVisible && (
                    <Box
                      background="bg-surface-info"
                      padding="400"
                      borderRadius="200"
                    >
                      <InlineStack
                        align="space-between"
                        blockAlign="start"
                        wrap={false}
                      >
                        <List gap="loose">
                          <List.Item>
                            Abandoned orders will be created if the customer
                            fill the{" "}
                            <Text as="span" fontWeight="semibold">
                              phone number or the email
                            </Text>{" "}
                            but didn&apos;t submit the order within{" "}
                            <Text as="span" fontWeight="semibold">
                              {abandonedCartDelay === "60"
                                ? "1 hour"
                                : abandonedCartDelay === "120"
                                  ? "2 hours"
                                  : abandonedCartDelay === "240"
                                    ? "4 hours"
                                    : abandonedCartDelay === "360"
                                      ? "6 hours"
                                      : abandonedCartDelay === "720"
                                        ? "12 hours"
                                        : abandonedCartDelay === "1440"
                                          ? "24 hours"
                                          : abandonedCartDelay === "2880"
                                            ? "48 hours"
                                            : abandonedCartDelay === "10080"
                                              ? "7 days"
                                              : `${abandonedCartDelay} minutes`}
                            </Text>
                            .
                          </List.Item>
                          <List.Item>
                            Abandoned checkouts will be created as{" "}
                            <Text as="span" fontWeight="semibold">
                              Draft orders
                            </Text>{" "}
                            and you can find them on:{" "}
                            <Text as="span" fontWeight="semibold">
                              Shopify Admin &gt; Orders &gt; Drafts
                            </Text>
                            .
                          </List.Item>
                          <List.Item>
                            Abandoned orders will have{" "}
                            <Text as="span" fontWeight="semibold">
                              buyease-abandoned-checkout
                            </Text>{" "}
                            tag.
                          </List.Item>
                          <List.Item>
                            To recover abandoned orders you have 3 options.
                            First, you can phone the customer yourself. Second,
                            you can use the automatic text message feature found
                            on the{" "}
                            <Link url="#">SMS / WhatsApp Messages</Link> page in
                            our app.
                          </List.Item>
                          <List.Item>
                            The third option through Email marketing using{" "}
                            <Text as="span" fontWeight="semibold">
                              Omnisend
                            </Text>{" "}
                            or{" "}
                            <Text as="span" fontWeight="semibold">
                              Klaviyo
                            </Text>
                            .
                          </List.Item>
                        </List>
                        <Button
                          variant="plain"
                          icon={XSmallIcon}
                          onClick={() => setAbandonedBannerVisible(false)}
                          accessibilityLabel="Dismiss"
                        />
                      </InlineStack>
                    </Box>
                  )}

                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    padding="400"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" fontWeight="semibold">
                        Omnisend
                      </Text>
                      <InlineStack gap="400" blockAlign="center">
                        <InlineStack gap="100" blockAlign="center">
                          <Link url="#">Step by step guide</Link>
                          <Icon source={ExternalIcon} />
                        </InlineStack>
                        <Button>Enable</Button>
                      </InlineStack>
                    </InlineStack>
                  </Box>

                  <Box
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    padding="400"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" fontWeight="semibold">
                        Klaviyo
                      </Text>
                      <InlineStack gap="400" blockAlign="center">
                        <InlineStack gap="100" blockAlign="center">
                          <Link url="#">Step by step guide</Link>
                          <Icon source={ExternalIcon} />
                        </InlineStack>
                        <Button>Enable</Button>
                      </InlineStack>
                    </InlineStack>
                  </Box>

                  <Checkbox
                    label="Open the form automatically when the recovery link is clicked."
                    checked={autoOpenRecovery}
                    onChange={setAutoOpenRecovery}
                  />

                  <BlockStack gap="300">
                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      Apply this discount to abandoned orders
                    </Text>
                    <InlineGrid columns={2} gap="400">
                      <Select
                        label="Discount type"
                        options={[
                          { label: "No discount", value: "no-discount" },
                          { label: "Fixed amount", value: "fixed-amount" },
                          { label: "Percentage", value: "percentage" },
                        ]}
                        value={discountType}
                        onChange={(v) => setDiscountType(v as DiscountType)}
                      />
                      <TextField
                        label="Discount value"
                        value={discountValue}
                        onChange={setDiscountValue}
                        type="number"
                        autoComplete="off"
                      />
                    </InlineGrid>
                  </BlockStack>
                </BlockStack>
              )}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 5. Advanced settings */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Advanced settings
        </Text>
        <Card padding="0">
          {/* Upsell options */}
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Upsell options
              </Text>
              <BlockStack gap="200">
                <Checkbox
                  label="Create original order and the upsell simultaneously"
                  helpText="When enabled, both the original order and upsell will be created together. The order is finalized when the customer accepts or rejects the upsell, or after 10 minutes if no action is taken."
                  checked={upsellSimultaneous}
                  onChange={setUpsellSimultaneous}
                />
                <Checkbox
                  label="Create upsells as a separate order"
                  checked={upsellSeparate}
                  onChange={setUpsellSeparate}
                />
              </BlockStack>
            </BlockStack>
          </Box>

          <Divider />

          {/* Order options */}
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Order options
              </Text>
              <BlockStack gap="200">
                <Checkbox
                  label="Remove the country code from phone number in the final Shopify order"
                  helpText="Keep the phone number in Shopify exactly as the customer entered it."
                  checked={removeCountryCode}
                  onChange={setRemoveCountryCode}
                />
                <Checkbox
                  label="Create draft orders instead of regular orders"
                  helpText="Orders will be created as draft orders. You can edit them and convert them to regular orders."
                  checked={createDraftOrders}
                  onChange={setCreateDraftOrders}
                />
                <Checkbox
                  label="Add buyease_cod_form tag to orders"
                  checked={addCodTag}
                  onChange={setAddCodTag}
                />
                <Checkbox
                  label="Include UTM parameters on order additional details"
                  checked={includeUtmParams}
                  onChange={setIncludeUtmParams}
                />
              </BlockStack>
            </BlockStack>
          </Box>

          <Divider />

          {/* Form options */}
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Form options
              </Text>
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
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 6. Custom Styles */}
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

      <Divider />

      {/* 7. Import/Export */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Import/Export
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            You can import or export your settings to duplicate them on another
            store or to backup your current settings
          </Text>
        </BlockStack>
        <Card padding="0">
          {/* Export */}
          <Box padding="400">
            <InlineStack gap="400" blockAlign="start" wrap={false}>
              <Box minWidth="60px">
                <Text as="h3" variant="headingSm">
                  Export
                </Text>
              </Box>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  Download a backup file, you can use it to duplicate your
                  settings on another store.
                </Text>
                <InlineStack>
                  <Button>Export</Button>
                </InlineStack>
              </BlockStack>
            </InlineStack>
          </Box>

          <Divider />

          {/* Import */}
          <Box padding="400">
            <InlineStack gap="400" blockAlign="start" wrap={false}>
              <Box minWidth="60px">
                <Text as="h3" variant="headingSm">
                  Import
                </Text>
              </Box>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  Upload a backup file to import your settings.
                </Text>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    setImportFile(e.target.files?.[0] ?? null)
                  }
                />
                <InlineStack>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select file
                  </Button>
                </InlineStack>
                {importFile && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {importFile.name}
                  </Text>
                )}
                <InlineStack align="end">
                  <Button disabled={!importFile}>Import</Button>
                </InlineStack>
              </BlockStack>
            </InlineStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 8. Restore default settings */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Restore default settings
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            This option will restore the default settings and form config
          </Text>
        </BlockStack>
        <Card padding="0">
          <Box padding="400">
            <InlineStack>
              <Button tone="critical" icon={RefreshIcon}>
                Restore
              </Button>
            </InlineStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* 9. Edit Languages */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <Text as="h2" variant="headingMd">
          Edit Languages
        </Text>
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              {showTranslationBanner && (
                <Banner
                  title="Advanced Translation"
                  tone="info"
                  onDismiss={() => setShowTranslationBanner(false)}
                >
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      Our paid plans offer an advanced localization feature that
                      allows you to translate every part of your form, including
                      fields, settings, shipping details, upsells, and offers.
                    </Text>
                    <Link url="#">
                      How to set up a multi-language store with Cash on Delivery
                      on Shopify?
                    </Link>
                  </BlockStack>
                </Banner>
              )}
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  Add new language
                </Text>
                <InlineStack gap="200" blockAlign="end">
                  <Box minWidth="200px">
                    <Select
                      label="Language"
                      labelHidden
                      placeholder="Select language"
                      options={[
                        { label: "Arabic", value: "ar" },
                        { label: "French", value: "fr" },
                        { label: "Spanish", value: "es" },
                        { label: "German", value: "de" },
                        { label: "Italian", value: "it" },
                        { label: "Portuguese", value: "pt" },
                        { label: "Turkish", value: "tr" },
                      ]}
                      value={selectedLanguage}
                      onChange={(v) => setSelectedLanguage(v)}
                    />
                  </Box>
                  <Button disabled={!selectedLanguage}>Add</Button>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Select the language you want to translate to
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  You only need to change this section if you are using{" "}
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    multiple languages
                  </Text>{" "}
                  on your store.
                </Text>
              </BlockStack>
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}

function GoogleGIcon(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type SheetsStatus =
  | { connected: false }
  | {
      connected: true;
      email: string;
      spreadsheetId: string | null;
      spreadsheetUrl: string | null;
      sheetName: string;
      isEnabled: boolean;
      lastSyncAt: string | null;
      lastSyncError: string | null;
    };

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function GoogleSheetsTabContent(): ReactElement {
  const [status, setStatus] = useState<SheetsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [sheetsError, setSheetsError] = useState("");
  const [tabsError, setTabsError] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [needsDriveApiEnabled, setNeedsDriveApiEnabled] = useState(false);

  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Orders");
  const [isEnabled, setIsEnabled] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<{ id: string; name: string }[]>([]);
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [tabsLoaded, setTabsLoaded] = useState(false);

  const bearerRef = useRef<string | null>(null);

  const getBearer = useCallback(async (): Promise<string> => {
    if (bearerRef.current) return bearerRef.current;
    const w = window as Window & { shopify?: { idToken?: () => Promise<string> } };
    const token = (await w.shopify?.idToken?.()) ?? "";
    bearerRef.current = token;
    return token;
  }, []);

  const fetchSpreadsheets = useCallback(async (bearer: string): Promise<void> => {
    setIsLoadingSheets(true);
    setSheetsError("");
    setNeedsReauth(false);
    setNeedsDriveApiEnabled(false);
    try {
      const res = await fetch("/api/google/spreadsheets", {
        headers: { Authorization: `Bearer ${bearer}` },
      });
      const data = (await res.json()) as {
        spreadsheets?: { id: string; name: string }[];
        error?: string;
        needsReauth?: boolean;
        needsDriveApiEnabled?: boolean;
      };
      if (!res.ok || data.error) {
        if (data.needsDriveApiEnabled) setNeedsDriveApiEnabled(true);
        else if (data.needsReauth) setNeedsReauth(true);
        setSheetsError(data.error ?? "Could not load spreadsheets.");
      } else {
        setAvailableSheets(data.spreadsheets ?? []);
      }
    } catch {
      setSheetsError("Network error loading spreadsheets.");
    } finally {
      setIsLoadingSheets(false);
    }
  }, []);

  const fetchStatus = useCallback(async (): Promise<void> => {
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load status");
      const data = (await res.json()) as SheetsStatus;
      setStatus(data);
      if (data.connected) {
        setSpreadsheetId(data.spreadsheetId ?? "");
        setSheetName(data.sheetName);
        setIsEnabled(data.isEnabled);
        if (data.spreadsheetId && data.sheetName) {
          setAvailableTabs([data.sheetName]);
          setTabsLoaded(true);
        }
        void fetchSpreadsheets(token);
      }
    } catch {
      setStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  }, [getBearer, fetchSpreadsheets]);

  useEffect(() => {
    void fetchStatus();
    const handler = (event: MessageEvent<unknown>): void => {
      if (
        event.data &&
        typeof event.data === "object" &&
        (event.data as Record<string, unknown>).type === "BUYEASE_GOOGLE_CONNECTED"
      ) {
        setIsLoading(true);
        void fetchStatus();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [fetchStatus]);

  const handleConnectGoogle = useCallback(async (): Promise<void> => {
    const token = await getBearer();
    const res = await fetch("/api/google/connect", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setSaveError(body.error ?? "Google OAuth is not configured. Contact support.");
      return;
    }
    const { authUrl } = (await res.json()) as { authUrl: string };
    window.open(authUrl, "buyease-google-oauth", "width=560,height=680,left=200,top=100");
  }, [getBearer]);

  const handleSelectSpreadsheet = useCallback(async (id: string): Promise<void> => {
    setSpreadsheetId(id);
    setTabsLoaded(false);
    setAvailableTabs([]);
    setTabsError("");
    if (!id) return;
    setIsLoadingTabs(true);
    try {
      const token = await getBearer();
      const res = await fetch(
        `/api/google/sheet-tabs?spreadsheetId=${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = (await res.json()) as { tabs?: string[]; error?: string };
      if (!res.ok || data.error) {
        setTabsError(data.error ?? "Could not load sheet tabs.");
      } else {
        const tabs = data.tabs ?? ["Orders"];
        setAvailableTabs(tabs);
        setTabsLoaded(true);
        setSheetName(tabs[0] ?? "Orders");
      }
    } catch {
      setTabsError("Network error loading tabs.");
    } finally {
      setIsLoadingTabs(false);
    }
  }, [getBearer]);

  const handleRefreshTabs = useCallback(async (): Promise<void> => {
    if (!spreadsheetId) return;
    setIsLoadingTabs(true);
    setTabsError("");
    try {
      const token = await getBearer();
      const res = await fetch(
        `/api/google/sheet-tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = (await res.json()) as { tabs?: string[]; error?: string };
      if (!res.ok || data.error) {
        setTabsError(data.error ?? "Could not load sheet tabs.");
      } else {
        const tabs = data.tabs ?? ["Orders"];
        setAvailableTabs(tabs);
        setTabsLoaded(true);
        if (!tabs.includes(sheetName)) setSheetName(tabs[0] ?? "Orders");
      }
    } catch {
      setTabsError("Network error loading tabs.");
    } finally {
      setIsLoadingTabs(false);
    }
  }, [getBearer, spreadsheetId, sheetName]);

  const handleSave = useCallback(async (): Promise<void> => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/configure-sheet", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId, sheetName, isEnabled }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; spreadsheetTitle?: string };
      if (!res.ok || data.error) {
        setSaveError(data.error ?? "Failed to save settings.");
      } else {
        const name =
          data.spreadsheetTitle ??
          availableSheets.find((s) => s.id === spreadsheetId)?.name ??
          spreadsheetId;
        setSaveSuccess(`Connected to "${name}".`);
        await fetchStatus();
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [getBearer, spreadsheetId, sheetName, isEnabled, availableSheets, fetchStatus]);

  const handleExport = useCallback(async (): Promise<void> => {
    setExportMsg("");
    setIsExporting(true);
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/export", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (!res.ok || data.error) {
        setExportMsg(`Export failed: ${data.error ?? "Unknown error"}`);
      } else {
        setExportMsg(`${data.count ?? 0} orders exported successfully.`);
        await fetchStatus();
      }
    } catch {
      setExportMsg("Network error during export.");
    } finally {
      setIsExporting(false);
    }
  }, [getBearer, fetchStatus]);

  const handleDisconnect = useCallback(async (): Promise<void> => {
    setIsDisconnecting(true);
    try {
      const token = await getBearer();
      await fetch("/api/google/disconnect", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setStatus({ connected: false });
      setSpreadsheetId("");
      setSheetName("Orders");
      setIsEnabled(false);
      setSaveError("");
      setSaveSuccess("");
      setExportMsg("");
      setAvailableSheets([]);
      setAvailableTabs([]);
      setTabsLoaded(false);
      setNeedsReauth(false);
      setNeedsDriveApiEnabled(false);
    } catch {
      // Non-critical
    } finally {
      setIsDisconnecting(false);
    }
  }, [getBearer]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <BlockStack gap="400">
        <Card><BlockStack gap="400"><SkeletonBodyText lines={4} /></BlockStack></Card>
        <Card><BlockStack gap="400"><SkeletonBodyText lines={6} /></BlockStack></Card>
      </BlockStack>
    );
  }

  // ── Not connected ──────────────────────────────────────────────────────────

  if (!status?.connected) {
    return (
      <Card>
        <Box paddingBlock="1200" paddingInline="600">
          <BlockStack gap="600" inlineAlign="center">
            <div style={{ width: 56, height: 56 }}>
              <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">
                <path fill="#43A047" d="M37 45H11c-1.657 0-3-1.343-3-3V6c0-1.657 1.343-3 3-3h19l10 10v29c0 1.657-1.343 3-3 3z"/>
                <path fill="#C8E6C9" d="M40 13H30V3z"/>
                <path fill="#2E7D32" d="M30 13l10 10V13z"/>
                <rect width="22" height="2" x="13" y="22" fill="#fff" rx="1"/>
                <rect width="22" height="2" x="13" y="27" fill="#fff" rx="1"/>
                <rect width="22" height="2" x="13" y="32" fill="#fff" rx="1"/>
                <rect width="8" height="2" x="13" y="17" fill="#fff" rx="1"/>
              </svg>
            </div>
            <BlockStack gap="200" inlineAlign="center">
              <Text as="h2" variant="headingLg" alignment="center">Sync orders to Google Sheets</Text>
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                Automatically export every COD order to your spreadsheet in real time. No manual work needed.
              </Text>
            </BlockStack>
            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError("")}>
                <Text as="p" variant="bodyMd">{saveError}</Text>
              </Banner>
            )}
            <button
              type="button"
              onClick={() => void handleConnectGoogle()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                height: "44px", padding: "0 24px", borderRadius: "8px",
                border: "1.5px solid #e0e0e0", background: "#ffffff", cursor: "pointer",
                fontFamily: "inherit", fontSize: "15px", fontWeight: "500",
                color: "#303030", boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
              }}
            >
              <GoogleGIcon />
              Sign in with Google
            </button>
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              After signing in, return here to configure your spreadsheet.
            </Text>
            <div style={{ maxWidth: 540, width: "100%" }}>
              <div style={{ backgroundColor: "#FEF3C7", borderRadius: 8, padding: "14px 16px" }}>
                <InlineStack gap="200" blockAlign="start" wrap={false}>
                  <Icon source={AlertCircleIcon} tone="caution" />
                  <Text as="p" variant="bodySm">
                    <Text as="span" fontWeight="bold">Important:</Text>{" "}
                    When signing in, tick both checkboxes to grant BuyEase access to your Google Sheets.
                  </Text>
                </InlineStack>
              </div>
              <Box paddingBlockStart="300">
                <Box borderRadius="200" borderWidth="025" borderColor="border" overflowX="hidden" overflowY="hidden">
                  <Image
                    src="/images/en.checkboxes-google-account.png"
                    alt="Google sign-in dialog showing two permission checkboxes"
                    width={800} height={420} loading="eager"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </Box>
            </div>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────────

  const connectedStatus = status;
  const canSave = !!spreadsheetId && tabsLoaded;
  const sheetOptions = availableSheets.map((s) => ({ label: s.name, value: s.id }));
  const tabOptions = availableTabs.map((t) => ({ label: t, value: t }));
  const currentSheetName = availableSheets.find((s) => s.id === spreadsheetId)?.name;

  return (
    <BlockStack gap="500">

      {/* ── Action bar ────────────────────────────────────────────────────── */}
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <InlineStack gap="200" blockAlign="center">
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <GoogleGIcon />
          </div>
          <BlockStack gap="0">
            <Text as="p" variant="bodySm" fontWeight="semibold">Google account connected</Text>
            {connectedStatus.email && (
              <Text as="p" variant="bodySm" tone="subdued">{connectedStatus.email}</Text>
            )}
          </BlockStack>
        </InlineStack>
        <InlineStack gap="300" blockAlign="center">
          {connectedStatus.spreadsheetUrl && (
            <Button
              url={connectedStatus.spreadsheetUrl}
              external
              icon={ExternalIcon}
              variant="plain"
            >
              Open spreadsheet
            </Button>
          )}
          <Button
            tone="critical"
            variant="plain"
            loading={isDisconnecting}
            onClick={() => void handleDisconnect()}
          >
            Disconnect
          </Button>
        </InlineStack>
      </InlineStack>

      {/* ── Error banners ─────────────────────────────────────────────────── */}
      {needsDriveApiEnabled && (
        <Banner title="Google Drive API not enabled" tone="critical">
          <Text as="p" variant="bodyMd">
            The Google Drive API is not enabled for this app. Go to{" "}
            <Link url="https://console.cloud.google.com/apis/library/drive.googleapis.com" external>
              Google Cloud Console
            </Link>{" "}
            and enable the Drive API, then refresh this page.
          </Text>
        </Banner>
      )}
      {needsReauth && !needsDriveApiEnabled && (
        <Banner
          title="Additional permission needed"
          tone="warning"
          action={{ content: "Reconnect Google account", onAction: () => void handleConnectGoogle() }}
        >
          <Text as="p" variant="bodyMd">
            Your Google account needs to be reconnected to grant BuyEase access to list your spreadsheets.
          </Text>
        </Banner>
      )}

      {/* ── Step 1: Select spreadsheet ────────────────────────────────────── */}
      <Card padding="0">
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">1. Select the Google Sheet where orders will be imported</Text>

            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError("")}>
                <Text as="p" variant="bodyMd">{saveError}</Text>
              </Banner>
            )}
            {saveSuccess && (
              <Banner tone="success" onDismiss={() => setSaveSuccess("")}>
                <Text as="p" variant="bodyMd">{saveSuccess}</Text>
              </Banner>
            )}

            <Checkbox
              label="Enable automatic import of your orders on Google Sheets"
              checked={isEnabled}
              onChange={setIsEnabled}
            />

            {/* Spreadsheet picker */}
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">Select your spreadsheet</Text>
              {sheetsError && !needsReauth && (
                <Text as="p" variant="bodySm" tone="critical">{sheetsError}</Text>
              )}
              <InlineStack gap="200" blockAlign="center">
                {sheetOptions.length > 0 ? (
                  <div style={{ flex: 1 }}>
                    <Select
                      label=""
                      labelHidden
                      options={[{ label: "Select your spreadsheet", value: "" }, ...sheetOptions]}
                      value={spreadsheetId}
                      onChange={(val) => void handleSelectSpreadsheet(val)}
                      disabled={isLoadingSheets}
                    />
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <Select
                      label=""
                      labelHidden
                      options={[
                        {
                          label: isLoadingSheets ? "Loading…" : "No spreadsheets found",
                          value: "",
                        },
                      ]}
                      value=""
                      onChange={() => undefined}
                      disabled
                    />
                  </div>
                )}
                <Button
                  icon={RefreshIcon}
                  loading={isLoadingSheets}
                  onClick={() => {
                    void getBearer().then((t) => fetchSpreadsheets(t));
                  }}
                >
                  Refresh
                </Button>
              </InlineStack>
              {currentSheetName && spreadsheetId && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Selected: {currentSheetName}
                </Text>
              )}
            </BlockStack>

            {/* Sheet tab picker — shown once a spreadsheet is selected */}
            {spreadsheetId && (
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" fontWeight="semibold">Select your sheet</Text>
                {tabsError && (
                  <Text as="p" variant="bodySm" tone="critical">{tabsError}</Text>
                )}
                <InlineStack gap="200" blockAlign="center">
                  <div style={{ flex: 1 }}>
                    <Select
                      label=""
                      labelHidden
                      options={
                        tabOptions.length > 0
                          ? tabOptions
                          : [{ label: isLoadingTabs ? "Loading…" : "No tabs found", value: "" }]
                      }
                      value={sheetName}
                      onChange={setSheetName}
                      disabled={isLoadingTabs || !tabsLoaded}
                    />
                  </div>
                  <Button
                    icon={RefreshIcon}
                    loading={isLoadingTabs}
                    disabled={!spreadsheetId}
                    onClick={() => void handleRefreshTabs()}
                  >
                    Refresh
                  </Button>
                </InlineStack>
              </BlockStack>
            )}

            <InlineStack align="end">
              <Button
                variant="primary"
                loading={isSaving}
                disabled={!canSave}
                onClick={() => void handleSave()}
              >
                Save settings
              </Button>
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>

      {/* ── Sync status & export ──────────────────────────────────────────── */}
      <Card padding="0">
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Sync & export</Text>

            {exportMsg && (
              <Banner
                tone={exportMsg.startsWith("Export failed") ? "critical" : "success"}
                onDismiss={() => setExportMsg("")}
              >
                <Text as="p" variant="bodyMd">{exportMsg}</Text>
              </Banner>
            )}
            {connectedStatus.lastSyncError && (
              <Banner tone="warning">
                <Text as="p" variant="bodySm">Last sync error: {connectedStatus.lastSyncError}</Text>
              </Banner>
            )}

            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" fontWeight="semibold">Last sync</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {connectedStatus.lastSyncAt
                    ? formatRelativeTime(connectedStatus.lastSyncAt)
                    : "No syncs yet"}
                </Text>
              </BlockStack>
              <Button
                icon={DataTableIcon}
                loading={isExporting}
                disabled={!connectedStatus.spreadsheetId}
                onClick={() => void handleExport()}
              >
                Export all orders
              </Button>
            </InlineStack>

            {!connectedStatus.spreadsheetId && (
              <Text as="p" variant="bodySm" tone="subdued">
                Save your spreadsheet settings above before exporting.
              </Text>
            )}
          </BlockStack>
        </Box>
      </Card>

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

/** Professional skeleton rendered on first mount before content hydrates. */
export function SettingsPageSkeleton(): ReactElement {
  return (
    <SkeletonPage title="Settings & Integrations" primaryAction>
      <BlockStack gap="400">
        {/* Tab bar skeleton */}
        <Card>
          <InlineGrid columns={5} gap="200">
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} paddingBlock="200">
                <SkeletonBodyText lines={1} />
              </Box>
            ))}
          </InlineGrid>
        </Card>

        {/* Section 1 */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <BlockStack gap="200">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={3} />
          </BlockStack>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={4} />
            </BlockStack>
          </Card>
        </InlineGrid>

        <Divider />

        {/* Section 2 */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <BlockStack gap="200">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </BlockStack>
          <Card>
            <BlockStack gap="400">
              <SkeletonBodyText lines={3} />
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        </InlineGrid>

        <Divider />

        {/* Section 3 */}
        <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
          <BlockStack gap="200">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </BlockStack>
          <Card>
            <BlockStack gap="400">
              <SkeletonBodyText lines={4} />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </SkeletonPage>
  );
}

type WhatsAppNotifications = {
  orderConfirmed: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  abandonedCart: boolean;
};

// ── WhatsApp templates fetched from admin DB ──────────────────────────────

type LiveTemplate = {
  messageType: string;
  metaTemplateName: string | null;
  body: string;
  variables: string[];
  metaStatus: string;
};

const TYPE_LABELS: Record<string, string> = {
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_SHIPPED:   "Order shipped",
  ORDER_DELIVERED: "Order delivered",
  ABANDONED_CART:  "Abandoned cart recovery",
};

/** Sample values substituted by variable name during preview. */
const VARIABLE_SAMPLES: Record<string, string> = {
  customerName: "Ahmed",
  orderId:      "#1042",
  shopName:     "Your Store",
  totalPrice:   "PKR 3,500",
  trackingUrl:  "https://track.example.com/BE-00142",
  carrierName:  "TCS",
  cartUrl:      "https://example.com/recover/abc123",
  productNames: "Black T-Shirt, Blue Jeans",
};

/** Fills {{variableName}} placeholders with sample values for preview. */
function renderTemplatePreview(body: string, variables: string[]): string {
  return variables.reduce(
    (text, varName) =>
      text.replaceAll(`{{${varName}}}`, VARIABLE_SAMPLES[varName] ?? `{{${varName}}}`),
    body,
  );
}

type WaTemplatePreviewProps = {
  title: string;
  metaName: string | null;
  body: string;
  variables: string[];
};

/** Read-only card showing a Meta-approved WhatsApp template. */
function WaTemplatePreview({
  title,
  metaName,
  body,
  variables,
}: WaTemplatePreviewProps): ReactElement {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Box borderWidth="025" borderColor="border" borderRadius="200" padding="0">
      {/* Header */}
      <Box padding="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text as="h3" variant="headingSm" fontWeight="semibold">
              {title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Template name:{" "}
              <Text as="span" variant="bodySm" fontWeight="semibold">
                {metaName}
              </Text>
            </Text>
          </BlockStack>
          <InlineStack gap="100" blockAlign="center">
            <Icon source={InfoIcon} tone="subdued" />
            <Text as="p" variant="bodySm" tone="subdued">
              Meta-approved
            </Text>
          </InlineStack>
        </InlineStack>
      </Box>

      <Divider />

      {/* Locked body */}
      <Box padding="400">
        <BlockStack gap="300">
          <Box
            background="bg-surface-secondary"
            borderRadius="200"
            padding="300"
          >
            <Text as="p" variant="bodyMd" tone="subdued">
              {body}
            </Text>
          </Box>

          <Text as="p" variant="bodySm" tone="subdued">
            Variables (filled automatically):{" "}
            {variables.map((varName: string, i: number) => (
              <Text key={varName} as="span" variant="bodySm" fontWeight="semibold">
                {`{{${varName}}}`} = {VARIABLE_SAMPLES[varName] ?? varName}
                {i < variables.length - 1 ? ",  " : ""}
              </Text>
            ))}
          </Text>

          {/* Live preview toggle */}
          <InlineStack>
            <Button
              variant="plain"
              size="slim"
              icon={showPreview ? ChevronUpIcon : ChevronDownIcon}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? "Hide preview" : "Preview with sample data"}
            </Button>
          </InlineStack>

          {showPreview && (
            <Box background="bg-surface-info" borderRadius="200" padding="300">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Preview (sample data):
                </Text>
                <Text as="p" variant="bodyMd">
                  {renderTemplatePreview(body, variables)}
                </Text>
              </BlockStack>
            </Box>
          )}
        </BlockStack>
      </Box>
    </Box>
  );
}

function WhatsAppTabContent(): ReactElement {
  const [isEnabled, setIsEnabled] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState("");
  // Credit balance is fetched from the server in production.
  // Shown as 0 cents here until the API layer is wired up.
  const creditBalanceCents = 0;
  const [abandonedCartDelay, setAbandonedCartDelay] = useState("15");
  const [templates, setTemplates] = useState<LiveTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [notifications, setNotifications] = useState<WhatsAppNotifications>({
    orderConfirmed: true,
    orderShipped: true,
    orderDelivered: false,
    abandonedCart: false,
  });

  const toggleNotification = useCallback(
    (key: keyof WhatsAppNotifications, value: boolean): void => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    fetch("/api/whatsapp/templates")
      .then((r) => r.json())
      .then((data: unknown) => {
        setTemplates(Array.isArray(data) ? (data as LiveTemplate[]) : []);
      })
      .catch(() => setTemplates([]))
      .finally(() => setIsLoadingTemplates(false));
  }, []);

  return (
    <BlockStack gap="800">
      {/* ── Activation ──────────────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            WhatsApp notifications
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            BuyEase sends WhatsApp messages on your behalf using a shared
            provider managed by the BuyEase team. You are charged per message
            sent from your credit balance.
          </Text>
        </BlockStack>

        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              {/* Info banner */}
              <Banner tone="info">
                <Text as="p" variant="bodyMd">
                  WhatsApp messaging is a paid add-on.{" "}
                  <Text as="span" fontWeight="semibold">
                    Messages are billed per send
                  </Text>{" "}
                  from your credit balance. Top up your balance to activate.
                </Text>
              </Banner>

              {/* Enable toggle row */}
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Enable WhatsApp messaging
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Requires a positive credit balance to activate.
                  </Text>
                </BlockStack>
                <Checkbox
                  label=""
                  labelHidden
                  checked={isEnabled}
                  onChange={setIsEnabled}
                  disabled={creditBalanceCents === 0}
                />
              </InlineStack>

              {/* Recipient number */}
              <TextField
                label="Your WhatsApp number"
                value={recipientNumber}
                onChange={setRecipientNumber}
                placeholder="+923001234567"
                helpText="Include the country code. Customers will receive messages from BuyEase's verified sender."
                autoComplete="off"
              />

              {/* Credit balance indicator */}
              <Box
                background={
                  creditBalanceCents > 0 ? "bg-surface-success" : "bg-surface-warning"
                }
                borderRadius="200"
                padding="300"
              >
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Credit balance
                  </Text>
                  <Text
                    as="p"
                    variant="bodyMd"
                    fontWeight="semibold"
                    tone={creditBalanceCents > 0 ? "success" : "caution"}
                  >
                    ${(creditBalanceCents / 100).toFixed(2)}
                  </Text>
                </InlineStack>
                {creditBalanceCents === 0 && (
                  <Text as="p" variant="bodySm" tone="caution">
                    Your balance is empty. Contact BuyEase support to top up.
                  </Text>
                )}
              </Box>
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* ── Order notifications ─────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Order notifications
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Choose which events trigger an automatic WhatsApp message to your
            customers.
          </Text>
        </BlockStack>

        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="300">
              <Checkbox
                label="Order confirmed"
                helpText="Send a confirmation message when a new COD order is placed."
                checked={notifications.orderConfirmed}
                onChange={(v) => toggleNotification("orderConfirmed", v)}
              />
              <Checkbox
                label="Order shipped"
                helpText="Notify the customer when their order has been dispatched."
                checked={notifications.orderShipped}
                onChange={(v) => toggleNotification("orderShipped", v)}
              />
              <Checkbox
                label="Order delivered"
                helpText="Notify the customer when their order has been delivered."
                checked={notifications.orderDelivered}
                onChange={(v) => toggleNotification("orderDelivered", v)}
              />
              <Checkbox
                label="Abandoned cart recovery"
                helpText="Send a follow-up message to customers who filled in their details but did not complete the order."
                checked={notifications.abandonedCart}
                onChange={(v) => toggleNotification("abandonedCart", v)}
              />
              {notifications.abandonedCart && (
                <Box paddingInlineStart="600">
                  <Select
                    label="Send recovery message after"
                    helpText="How long after abandonment before the WhatsApp recovery message is sent."
                    options={[
                      { label: "5 minutes", value: "5" },
                      { label: "10 minutes", value: "10" },
                      { label: "15 minutes (recommended)", value: "15" },
                      { label: "20 minutes", value: "20" },
                      { label: "30 minutes", value: "30" },
                      { label: "45 minutes", value: "45" },
                      { label: "1 hour", value: "60" },
                      { label: "2 hours", value: "120" },
                      { label: "4 hours", value: "240" },
                      { label: "6 hours", value: "360" },
                      { label: "12 hours", value: "720" },
                      { label: "24 hours", value: "1440" },
                      { label: "48 hours", value: "2880" },
                      { label: "7 days", value: "10080" },
                    ]}
                    value={abandonedCartDelay}
                    onChange={setAbandonedCartDelay}
                  />
                </Box>
              )}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Divider />

      {/* ── Message templates ───────────────────────────────────────── */}
      <InlineGrid columns={["oneThird", "twoThirds"]} gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Message templates
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            These templates are pre-approved by Meta and cannot be edited.
            Variable placeholders are filled automatically with live order and
            customer data at send time.
          </Text>
          <Banner tone="info">
            <Text as="p" variant="bodyMd">
              WhatsApp Cloud API requires all outbound messages to use{" "}
              <Text as="span" fontWeight="semibold">
                Meta-approved templates
              </Text>
              . Template text is managed by the BuyEase team and shared across
              all merchants.
            </Text>
          </Banner>
        </BlockStack>

        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              {isLoadingTemplates ? (
                <SkeletonBodyText lines={6} />
              ) : templates.length === 0 ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  No active templates configured. Contact BuyEase support.
                </Text>
              ) : (
                templates.map((tpl) => (
                  <WaTemplatePreview
                    key={tpl.messageType}
                    title={TYPE_LABELS[tpl.messageType] ?? tpl.messageType}
                    metaName={tpl.metaTemplateName}
                    body={tpl.body}
                    variables={tpl.variables}
                  />
                ))
              )}
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}

const VALID_TABS = new Set<SettingsTab>([
  "visibility",
  "general",
  "pixels",
  "google-sheets",
  "whatsapp",
]);

function resolveTab(raw: string | null): SettingsTab {
  return raw !== null && VALID_TABS.has(raw as SettingsTab)
    ? (raw as SettingsTab)
    : "visibility";
}

export function SettingsPageContent(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Derive active tab directly from URL — null-safe: searchParams can be null during SSR.
  const activeTab = resolveTab(searchParams?.get("tab") ?? null);

  useEffect(() => {
    // Show skeleton for one paint frame so Polaris hydrates cleanly,
    // then reveal real content immediately after.
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTabChange = useCallback(
    (tab: SettingsTab): void => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  if (!isMounted) {
    return <SettingsPageSkeleton />;
  }

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: "var(--p-space-100)",
            }}
          >
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
          </div>
        </Box>

        {activeTab === "visibility" ? (
          <VisibilityTabContent />
        ) : activeTab === "general" ? (
          <GeneralTabContent />
        ) : activeTab === "google-sheets" ? (
          <GoogleSheetsTabContent />
        ) : activeTab === "whatsapp" ? (
          <WhatsAppTabContent />
        ) : (
          <ComingSoon />
        )}
      </BlockStack>
    </Page>
  );
}
