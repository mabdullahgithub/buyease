"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  | "pixels";

type TabConfig = {
  id: SettingsTab;
  label: string;
  icon: IconSource;
};

const TABS: TabConfig[] = [
  { id: "visibility", label: "Visibility", icon: ViewIcon },
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "pixels", label: "Pixels", icon: CodeIcon },
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



// ── Types ────────────────────────────────────────────────────────────────────




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



const VALID_TABS = new Set<SettingsTab>([
  "visibility",
  "general",
  "pixels",
]);

function resolveTab(raw: string | null): SettingsTab {
  return raw !== null && VALID_TABS.has(raw as SettingsTab)
    ? (raw as SettingsTab)
    : "visibility";
}

export function SettingsPageContent(): ReactElement {
  const pathname = usePathname();
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
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname],
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
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
        ) : (
          <ComingSoon />
        )}
      </BlockStack>
    </Page>
  );
}
