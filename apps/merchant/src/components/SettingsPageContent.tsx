"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IconSource } from "@shopify/polaris";
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
  ClockIcon,
  CodeIcon,
  CollectionReferenceIcon,
  DeleteIcon,
  ExternalIcon,
  PlusIcon,
  ProductIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  XSmallIcon,
} from "@shopify/polaris-icons";

type SettingsTab = "general" | "pixels";

type TabConfig = {
  id: SettingsTab;
  label: string;
  icon: IconSource;
};

const TABS: TabConfig[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "pixels", label: "Pixels", icon: CodeIcon },
];

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



function GeneralTabContent(): ReactElement {
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
  const [showTranslationBanner, setShowTranslationBanner] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <BlockStack gap="800">
      {/* 1. Cash on Delivery fee */}
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

        </Card>
      </InlineGrid>

      <Divider />

      {/* 6. Import/Export */}
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
  "general",
  "pixels",
]);

function resolveTab(raw: string | null): SettingsTab {
  return raw !== null && VALID_TABS.has(raw as SettingsTab)
    ? (raw as SettingsTab)
    : "general";
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
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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

        {activeTab === "general" ? (
          <GeneralTabContent />
        ) : (
          <ComingSoon />
        )}
      </BlockStack>
    </Page>
  );
}
