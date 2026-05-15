"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import {
  Badge,
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
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  AlertCircleIcon,
  ChatIcon,
  CheckCircleIcon,
  DeleteIcon,
  ExternalIcon,
  ImageIcon,
  InfoIcon,
} from "@shopify/polaris-icons";

import { useShopifyBridge } from "@/lib/use-shopify-bridge";

// ── Types ────────────────────────────────────────────────────────────────────

type FormPlacement = "whole-store" | "product-pages" | "cart-page";
type WhenOpened = "product-only" | "product-and-cart";
type ProductRestrictionMode = "none" | "enable-only" | "disable-for";

type RestrictedProduct = {
  id: string;
  title: string;
  imageUrl: string;
  isSoldOut: boolean;
};

type RestrictedCollection = {
  id: string;
  title: string;
  imageUrl: string;
};

type PlacementConfig = {
  value: FormPlacement;
  label: string;
};

type DisableInState = {
  homePage: boolean;
  collectionPage: boolean;
  regularPage: boolean;
  searchResultPage: boolean;
  cartDrawer: boolean;
};

type RestrictState = {
  allowCountriesOnly: boolean;
  enableOrderEligibility: boolean;
};

type DisableInKey = keyof DisableInState;

// ── Resource picker response shapes ─────────────────────────────────────────

type PickerVariant = {
  inventoryQuantity?: number;
  inventoryPolicy?: string;
};

type PickerProduct = {
  id: string;
  title: string;
  status?: string;
  images?: { originalSrc?: string; src?: string }[];
  variants?: PickerVariant[];
};

type PickerCollection = {
  id: string;
  title: string;
  image?: { originalSrc?: string; src?: string } | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function gidToNumericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

function isProductSoldOut(item: PickerProduct): boolean {
  if (item.status && item.status !== "ACTIVE") return true;
  if (!item.variants || item.variants.length === 0) return false;
  return item.variants.every(
    (v) => (v.inventoryQuantity ?? 0) <= 0 && v.inventoryPolicy !== "continue",
  );
}

function productImageUrl(item: PickerProduct): string {
  return item.images?.[0]?.originalSrc ?? item.images?.[0]?.src ?? "";
}

function collectionImageUrl(item: PickerCollection): string {
  return item.image?.originalSrc ?? item.image?.src ?? "";
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLACEMENTS: PlacementConfig[] = [
  { value: "whole-store", label: "Whole store" },
  { value: "product-pages", label: "Product pages" },
  { value: "cart-page", label: "Cart page only" },
];

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

// ── Thumbnail ─────────────────────────────────────────────────────────────────

function ResourceThumbnail({ imageUrl, alt }: { imageUrl: string; alt: string }): ReactElement {
  if (!imageUrl) {
    return (
      <Box
        background="bg-surface-secondary"
        borderWidth="025"
        borderColor="border"
        borderRadius="200"
        width="48px"
        minHeight="48px"
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon source={ImageIcon} tone="subdued" />
        </div>
      </Box>
    );
  }
  return (
    <Box
      background="bg-surface"
      borderWidth="025"
      borderColor="border"
      borderRadius="200"
      overflowX="hidden"
      overflowY="hidden"
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={48}
        height={48}
        unoptimized
        style={{ display: "block", objectFit: "cover" }}
      />
    </Box>
  );
}

// ── Component props ──────────────────────────────────────────────────────────

type Props = {
  embedEnabled?: boolean | null;
};

// ── SettingsWorkspace ────────────────────────────────────────────────────────

export function SettingsWorkspace({ embedEnabled }: Props): ReactElement {
  const shopify = useShopifyBridge();

  const [themeEditorUrl, setThemeEditorUrl] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  // Form placement
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

  // Restriction (countries + order eligibility)
  const [restrict, setRestrict] = useState<RestrictState>({
    allowCountriesOnly: false,
    enableOrderEligibility: false,
  });

  // Product / collection restriction
  const [productRestrictionMode, setProductRestrictionMode] =
    useState<ProductRestrictionMode>("none");
  const [restrictedProducts, setRestrictedProducts] = useState<RestrictedProduct[]>([]);
  const [restrictedCollections, setRestrictedCollections] = useState<RestrictedCollection[]>([]);
  const [restrictionsLoading, setRestrictionsLoading] = useState(true);
  const [addingProducts, setAddingProducts] = useState(false);
  const [addingCollections, setAddingCollections] = useState(false);

  // Form options
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

  // ── Fetch existing restrictions on mount ────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchRestrictions(): Promise<void> {
      try {
        const token = await shopify.idToken();
        if (!token || cancelled) return;
        const res = await fetch("/api/form-restrictions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          productRestrictionMode: ProductRestrictionMode;
          restrictedProducts: RestrictedProduct[];
          restrictedCollections: RestrictedCollection[];
        };
        if (cancelled) return;
        setProductRestrictionMode(data.productRestrictionMode ?? "none");
        setRestrictedProducts(
          Array.isArray(data.restrictedProducts) ? data.restrictedProducts : [],
        );
        setRestrictedCollections(
          Array.isArray(data.restrictedCollections) ? data.restrictedCollections : [],
        );
      } catch {
        // leave defaults — user can re-configure
      } finally {
        if (!cancelled) setRestrictionsLoading(false);
      }
    }

    void fetchRestrictions();
    return () => { cancelled = true; };
  }, [shopify]);

  // ── Save restrictions to API ──────────────────────────────────────────────

  const saveRestrictions = useCallback(
    async (
      mode: ProductRestrictionMode,
      products: RestrictedProduct[],
      collections: RestrictedCollection[],
    ): Promise<void> => {
      try {
        const token = await shopify.idToken();
        if (!token) return;
        await fetch("/api/form-restrictions", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productRestrictionMode: mode,
            restrictedProducts: products,
            restrictedCollections: collections,
          }),
        });
        shopify.toast.show("Restrictions saved");
      } catch {
        shopify.toast.show("Failed to save restrictions");
      }
    },
    [shopify],
  );

  // ── Toggle restriction mode (mutually exclusive) ──────────────────────────

  const handleToggleEnableForProducts = useCallback(
    (checked: boolean): void => {
      const newMode: ProductRestrictionMode = checked ? "enable-only" : "none";
      setProductRestrictionMode(newMode);
      void saveRestrictions(newMode, restrictedProducts, restrictedCollections);
    },
    [restrictedProducts, restrictedCollections, saveRestrictions],
  );

  const handleToggleDisableForProducts = useCallback(
    (checked: boolean): void => {
      const newMode: ProductRestrictionMode = checked ? "disable-for" : "none";
      setProductRestrictionMode(newMode);
      void saveRestrictions(newMode, restrictedProducts, restrictedCollections);
    },
    [restrictedProducts, restrictedCollections, saveRestrictions],
  );

  // ── Resource picker: add products ─────────────────────────────────────────

  const handleAddProducts = useCallback(async (): Promise<void> => {
    setAddingProducts(true);
    try {
      const result = await window.shopify?.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        initialSelectionIds: restrictedProducts.map((p) => ({
          id: `gid://shopify/Product/${p.id}`,
        })),
      });

      if (!result || !Array.isArray(result) || result.length === 0) return;

      const selected = result as PickerProduct[];
      const merged: RestrictedProduct[] = [...restrictedProducts];

      for (const item of selected) {
        const numId = gidToNumericId(item.id);
        if (!merged.find((p) => p.id === numId)) {
          merged.push({
            id: numId,
            title: item.title,
            imageUrl: productImageUrl(item),
            isSoldOut: isProductSoldOut(item),
          });
        }
      }

      setRestrictedProducts(merged);
      void saveRestrictions(productRestrictionMode, merged, restrictedCollections);
    } finally {
      setAddingProducts(false);
    }
  }, [restrictedProducts, restrictedCollections, productRestrictionMode, saveRestrictions]);

  // ── Resource picker: add collections ──────────────────────────────────────

  const handleAddCollections = useCallback(async (): Promise<void> => {
    setAddingCollections(true);
    try {
      const result = await window.shopify?.resourcePicker({
        type: "collection",
        multiple: true,
        action: "select",
        initialSelectionIds: restrictedCollections.map((c) => ({
          id: `gid://shopify/Collection/${c.id}`,
        })),
      });

      if (!result || !Array.isArray(result) || result.length === 0) return;

      const selected = result as PickerCollection[];
      const merged: RestrictedCollection[] = [...restrictedCollections];

      for (const item of selected) {
        const numId = gidToNumericId(item.id);
        if (!merged.find((c) => c.id === numId)) {
          merged.push({
            id: numId,
            title: item.title,
            imageUrl: collectionImageUrl(item),
          });
        }
      }

      setRestrictedCollections(merged);
      void saveRestrictions(productRestrictionMode, restrictedProducts, merged);
    } finally {
      setAddingCollections(false);
    }
  }, [restrictedCollections, restrictedProducts, productRestrictionMode, saveRestrictions]);

  // ── Remove handlers ───────────────────────────────────────────────────────

  const handleRemoveProduct = useCallback(
    (id: string): void => {
      const next = restrictedProducts.filter((p) => p.id !== id);
      setRestrictedProducts(next);
      void saveRestrictions(productRestrictionMode, next, restrictedCollections);
    },
    [restrictedProducts, restrictedCollections, productRestrictionMode, saveRestrictions],
  );

  const handleRemoveCollection = useCallback(
    (id: string): void => {
      const next = restrictedCollections.filter((c) => c.id !== id);
      setRestrictedCollections(next);
      void saveRestrictions(productRestrictionMode, restrictedProducts, next);
    },
    [restrictedCollections, restrictedProducts, productRestrictionMode, saveRestrictions],
  );

  // ── Misc toggle ───────────────────────────────────────────────────────────

  const toggleRestrict = useCallback((key: keyof RestrictState, value: boolean): void => {
    setRestrict((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isCartPage = formPlacement === "cart-page";
  const isWholeStore = formPlacement === "whole-store";
  const isRestrictionActive =
    productRestrictionMode === "enable-only" || productRestrictionMode === "disable-for";

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
            Enable the BuyEase app embed in your active theme to start displaying the COD order form
            on your storefront.
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
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    Tip:{" "}
                  </Text>
                  Use the{" "}
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    Form Designer
                  </Text>{" "}
                  tab to customise colours, fields, and layout. Use{" "}
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    Form Placement
                  </Text>{" "}
                  below to control which pages and countries show the form.
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
                  If you can&apos;t see the form in your store, or you need help to enable it,
                  please contact us.
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
            Choose where you&apos;d like the form to be displayed. By default, it appears across the
            entire store, but you can restrict it to only show on the product page or cart page.
          </Text>
        </BlockStack>

        <Card padding="0">
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
                      { label: "Buy only the product on page", value: "product-only" },
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
            Restrict your order form to specific products, collections, countries, or order totals
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Choose to display your COD order form only for selected products and collections,
            specific countries, or based on the order total.
          </Text>
        </BlockStack>

        <Card padding="0">
          {/* ── Product / collection restriction ─────────────────────────── */}
          <Box padding="400">
            {restrictionsLoading ? (
              <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Loading restriction settings…
                </Text>
              </InlineStack>
            ) : (
              <BlockStack gap="300">
                <Checkbox
                  label="Enable your form only for specific products and collections"
                  checked={productRestrictionMode === "enable-only"}
                  disabled={productRestrictionMode === "disable-for"}
                  onChange={handleToggleEnableForProducts}
                />
                <Checkbox
                  label="Disable your form for one or more products and collections"
                  checked={productRestrictionMode === "disable-for"}
                  disabled={productRestrictionMode === "enable-only"}
                  onChange={handleToggleDisableForProducts}
                />
              </BlockStack>
            )}

            {/* ── Active restriction: product + collection lists ─────────── */}
            {isRestrictionActive && !restrictionsLoading && (
              <Box paddingBlockStart="400">
                <BlockStack gap="400">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {productRestrictionMode === "enable-only"
                      ? "Your form will only be active on the following products and collections:"
                      : "Your form will be disabled for the following products and collections:"}
                  </Text>

                  {/* ── Products ─────────────────────────────────────────── */}
                  <BlockStack gap="200">
                    <InlineStack>
                      <Button
                        variant="secondary"
                        loading={addingProducts}
                        onClick={() => void handleAddProducts()}
                      >
                        Add products
                      </Button>
                    </InlineStack>

                    {restrictedProducts.map((product) => (
                      <Box
                        key={product.id}
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                        padding="300"
                        background="bg-surface"
                      >
                        <InlineStack align="space-between" blockAlign="center" gap="300">
                          <InlineStack gap="300" blockAlign="center">
                            <ResourceThumbnail imageUrl={product.imageUrl} alt={product.title} />
                            <BlockStack gap="050">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                {product.title}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                Product ID: {product.id}
                              </Text>
                              {product.isSoldOut && <Badge tone="critical">Sold Out</Badge>}
                            </BlockStack>
                          </InlineStack>
                          <Button
                            variant="plain"
                            tone="critical"
                            icon={DeleteIcon}
                            accessibilityLabel={`Remove ${product.title}`}
                            onClick={() => handleRemoveProduct(product.id)}
                          />
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>

                  {/* ── Collections ──────────────────────────────────────── */}
                  <BlockStack gap="200">
                    <InlineStack>
                      <Button
                        variant="secondary"
                        loading={addingCollections}
                        onClick={() => void handleAddCollections()}
                      >
                        Add collections
                      </Button>
                    </InlineStack>

                    {restrictedCollections.map((collection) => (
                      <Box
                        key={collection.id}
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                        padding="300"
                        background="bg-surface"
                      >
                        <InlineStack align="space-between" blockAlign="center" gap="300">
                          <InlineStack gap="300" blockAlign="center">
                            <ResourceThumbnail
                              imageUrl={collection.imageUrl}
                              alt={collection.title}
                            />
                            <BlockStack gap="050">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                {collection.title}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                Collection ID: {collection.id}
                              </Text>
                            </BlockStack>
                          </InlineStack>
                          <Button
                            variant="plain"
                            tone="critical"
                            icon={DeleteIcon}
                            accessibilityLabel={`Remove ${collection.title}`}
                            onClick={() => handleRemoveCollection(collection.id)}
                          />
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Box>
            )}
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
