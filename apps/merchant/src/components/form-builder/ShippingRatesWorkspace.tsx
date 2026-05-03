"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  FormLayout,
  Icon,
  InlineStack,
  Link,
  Modal,
  RadioButton,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  DeliveryIcon,
  EditIcon,
  ImportIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XIcon,
} from "@shopify/polaris-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConditionBasis = "price" | "weight" | "quantity";

type ShippingRate = {
  id: string;
  name: string;
  description: string;
  /** 0 = free */
  price: number;
  hasConditions: boolean;
  conditionBasis: ConditionBasis;
  /** Numeric string — e.g. "0.00" */
  minValue: string;
  /** Numeric string or "" = No limit */
  maxValue: string;
  countriesOnly: boolean;
  countries: string;
  provincesOnly: boolean;
  provinces: string;
  productsOnly: boolean;
  excludeProducts: boolean;
  sortOrder: number;
};

type SortDir = "asc" | "desc" | null;

type Draft = Omit<ShippingRate, "id" | "sortOrder">;

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_RATES: ShippingRate[] = [
  {
    id: "rate-default",
    name: "Free Shipping",
    description: "",
    price: 0,
    hasConditions: false,
    conditionBasis: "price",
    minValue: "0.00",
    maxValue: "",
    countriesOnly: false,
    countries: "",
    provincesOnly: false,
    provinces: "",
    productsOnly: false,
    excludeProducts: false,
    sortOrder: 0,
  },
];

const EMPTY_DRAFT: Draft = {
  name: "",
  description: "",
  price: 0,
  hasConditions: false,
  conditionBasis: "price",
  minValue: "0.00",
  maxValue: "",
  countriesOnly: false,
  countries: "",
  provincesOnly: false,
  provinces: "",
  productsOnly: false,
  excludeProducts: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function buildConditionText(rate: ShippingRate): string {
  if (!rate.hasConditions) return "No conditions, always visible";

  const min = parseFloat(rate.minValue) || 0;
  const max = rate.maxValue !== "" ? parseFloat(rate.maxValue) : null;

  if (rate.conditionBasis === "price") {
    const minStr = `$${min.toFixed(2)}`;
    const maxStr = max !== null ? `$${max.toFixed(2)}` : "and up";
    return `Orders ${minStr} - ${maxStr}`;
  }
  if (rate.conditionBasis === "weight") {
    const minStr = `${min.toFixed(2)} lb`;
    const maxStr = max !== null ? `${max.toFixed(2)} lb` : "and up";
    return `Orders ${minStr} - ${maxStr}`;
  }
  // quantity
  const maxStr = max !== null ? String(max) : "and up";
  return `Qty ${String(min)} - ${maxStr}`;
}

let nextId = 100;
function generateId(): string {
  nextId += 1;
  return `rate-${nextId}`;
}

// ─── Rate row ─────────────────────────────────────────────────────────────────

type RateRowProps = {
  rate: ShippingRate;
  onEdit: (rate: ShippingRate) => void;
  onDelete: (id: string) => void;
};

function RateRow({ rate, onEdit, onDelete }: RateRowProps): ReactElement {
  const conditionText = buildConditionText(rate);

  return (
    <>
      <Box paddingBlock="300" paddingInline="400">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 110px 1.2fr auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {/* Name */}
          <InlineStack gap="200" blockAlign="center" wrap={false}>
            <Icon source={DeliveryIcon} tone="subdued" />
            <Text as="span" variant="bodyMd">
              {rate.name}
            </Text>
          </InlineStack>

          {/* Price */}
          <Box>
            {rate.price === 0 ? (
              <Badge tone="success">Free</Badge>
            ) : (
              <Badge tone="info">{formatPrice(rate.price)}</Badge>
            )}
          </Box>

          {/* Condition */}
          <Text as="span" variant="bodyMd" tone="subdued">
            {conditionText}
          </Text>

          {/* Actions */}
          <InlineStack gap="100" blockAlign="center" wrap={false}>
            <Button
              variant="plain"
              icon={EditIcon}
              accessibilityLabel={`Edit ${rate.name}`}
              onClick={() => onEdit(rate)}
            />
            <Button
              variant="plain"
              tone="critical"
              icon={DeleteIcon}
              accessibilityLabel={`Delete ${rate.name}`}
              onClick={() => onDelete(rate.id)}
            />
          </InlineStack>
        </div>
      </Box>
      <Divider />
    </>
  );
}

// ─── Add/Edit modal ───────────────────────────────────────────────────────────

type RateModalProps = {
  open: boolean;
  isEditing: boolean;
  draft: Draft;
  onChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  onClose: () => void;
  onSave: () => void;
};

function RateModal({
  open,
  isEditing,
  draft,
  onChange,
  onClose,
  onSave,
}: RateModalProps): ReactElement {
  const priceDisplay = draft.price === 0 ? "Free" : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit rate" : "Add rate"}
      primaryAction={{ content: "Done", onAction: onSave }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* Name + Description */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <BlockStack gap="100">
              <TextField
                id="rate-modal-name"
                label="Rate name"
                value={draft.name}
                onChange={(v) => onChange("name", v)}
                autoComplete="off"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                Customers will see this at checkout.
              </Text>
            </BlockStack>
            <BlockStack gap="100">
              <TextField
                id="rate-modal-description"
                label="Rate description"
                value={draft.description}
                onChange={(v) => onChange("description", v)}
                autoComplete="off"
                placeholder="Subtitle, Ex: 2-3 days"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                Subtitle, Ex: 2-3 days
              </Text>
            </BlockStack>
          </div>

          {/* Price */}
          <TextField
            id="rate-modal-price"
            label="Price"
            type="number"
            prefix="USD"
            suffix={priceDisplay}
            value={String(draft.price)}
            onChange={(v) => onChange("price", parseFloat(v) || 0)}
            autoComplete="off"
            min={0}
            step={0.01}
          />

          {/* Conditions toggle */}
          <Box>
            {draft.hasConditions ? (
              <Button
                variant="plain"
                icon={MinusCircleIcon}
                onClick={() => onChange("hasConditions", false)}
              >
                Remove conditions
              </Button>
            ) : (
              <Button
                variant="plain"
                icon={PlusCircleIcon}
                onClick={() => onChange("hasConditions", true)}
              >
                Add conditions
              </Button>
            )}
          </Box>

          {/* Condition fields */}
          {draft.hasConditions ? (
            <Box
              borderWidth="025"
              borderColor="border"
              borderRadius="200"
              padding="300"
            >
              <BlockStack gap="300">
                <RadioButton
                  label="Based on order price"
                  id="cond-price"
                  checked={draft.conditionBasis === "price"}
                  onChange={() => onChange("conditionBasis", "price")}
                />
                <RadioButton
                  label="Based on order weight"
                  id="cond-weight"
                  checked={draft.conditionBasis === "weight"}
                  onChange={() => onChange("conditionBasis", "weight")}
                />
                <RadioButton
                  label="Based on order quantity"
                  id="cond-quantity"
                  checked={draft.conditionBasis === "quantity"}
                  onChange={() => onChange("conditionBasis", "quantity")}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <TextField
                    id="rate-modal-min"
                    label="Minimum price"
                    prefix="USD"
                    type="number"
                    value={draft.minValue}
                    onChange={(v) => onChange("minValue", v)}
                    autoComplete="off"
                    min={0}
                  />
                  <TextField
                    id="rate-modal-max"
                    label="Maximum price"
                    prefix="USD"
                    type="number"
                    value={draft.maxValue}
                    onChange={(v) => onChange("maxValue", v)}
                    autoComplete="off"
                    placeholder="No limit"
                    min={0}
                  />
                </div>
              </BlockStack>
            </Box>
          ) : null}

          {/* Countries + Provinces */}
          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            padding="300"
          >
            <BlockStack gap="300">
              <Checkbox
                id="rate-modal-countries"
                label="Apply this rate for certain countries only"
                checked={draft.countriesOnly}
                onChange={(v) => onChange("countriesOnly", v)}
              />
              {draft.countriesOnly ? (
                <TextField
                  id="rate-modal-countries-search"
                  label="Countries"
                  labelHidden
                  placeholder="Shipping to"
                  value={draft.countries}
                  onChange={(v) => onChange("countries", v)}
                  autoComplete="off"
                  prefix="🔍"
                />
              ) : null}
              <Checkbox
                id="rate-modal-provinces"
                label="Apply this rate for certain provinces / states only"
                checked={draft.provincesOnly}
                onChange={(v) => onChange("provincesOnly", v)}
              />
              {draft.provincesOnly ? (
                <TextField
                  id="rate-modal-provinces-search"
                  label="Provinces"
                  labelHidden
                  placeholder="Shipping to"
                  value={draft.provinces}
                  onChange={(v) => onChange("provinces", v)}
                  autoComplete="off"
                  prefix="🔍"
                />
              ) : null}
            </BlockStack>
          </Box>

          {/* Products */}
          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            padding="300"
          >
            <BlockStack gap="200">
              <Checkbox
                id="rate-modal-products"
                label="Apply this rate for certain products/collections only"
                checked={draft.productsOnly}
                onChange={(v) => onChange("productsOnly", v)}
              />
              <Checkbox
                id="rate-modal-exclude"
                label="Exclude selected products/collections from this rate"
                checked={draft.excludeProducts}
                onChange={(v) => onChange("excludeProducts", v)}
              />
            </BlockStack>
          </Box>

          {/* Live preview */}
          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            padding="300"
            background="bg-surface-secondary"
          >
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <input type="radio" readOnly checked style={{ accentColor: "#000" }} />
                <Text as="span" variant="bodyMd">
                  {draft.name !== "" ? draft.name : "—"}
                </Text>
              </InlineStack>
              <Text as="span" variant="bodyMd">
                {draft.price === 0 ? "$0.00" : formatPrice(draft.price)}
              </Text>
            </InlineStack>
          </Box>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

/**
 * Shipping Rates workspace for the Form Builder tab.
 * Manages a local list of shipping rates with add / edit / delete and
 * price-sort capabilities. No API calls yet — persistence is wired up
 * in Phase 2 when the /api/shipping-rates route is implemented.
 */
export function ShippingRatesWorkspace(): ReactElement {
  const [enabled, setEnabled] = useState(true);
  const [rates, setRates] = useState<ShippingRate[]>(INITIAL_RATES);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const displayRates =
    sortDir === null
      ? rates
      : [...rates].sort((a, b) =>
          sortDir === "asc" ? a.price - b.price : b.price - a.price,
        );

  // ── Draft helpers ────────────────────────────────────────────────────────

  const setDraftField = useCallback(
    <K extends keyof Draft>(key: K, value: Draft[K]): void => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ── Modal open/close ─────────────────────────────────────────────────────

  const openAdd = useCallback((): void => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((rate: ShippingRate): void => {
    setEditingId(rate.id);
    setDraft({
      name: rate.name,
      description: rate.description,
      price: rate.price,
      hasConditions: rate.hasConditions,
      conditionBasis: rate.conditionBasis,
      minValue: rate.minValue,
      maxValue: rate.maxValue,
      countriesOnly: rate.countriesOnly,
      countries: rate.countries,
      provincesOnly: rate.provincesOnly,
      provinces: rate.provinces,
      productsOnly: rate.productsOnly,
      excludeProducts: rate.excludeProducts,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setModalOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback((): void => {
    if (draft.name.trim() === "") return;

    if (editingId !== null) {
      setRates((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...draft } : r,
        ),
      );
    } else {
      const newRate: ShippingRate = {
        id: generateId(),
        sortOrder: rates.length,
        ...draft,
      };
      setRates((prev) => [...prev, newRate]);
    }
    closeModal();
  }, [draft, editingId, rates.length, closeModal]);

  const handleDelete = useCallback((id: string): void => {
    setRates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ── Sort ─────────────────────────────────────────────────────────────────

  const handleSortAsc = useCallback((): void => setSortDir("asc"), []);
  const handleSortDesc = useCallback((): void => setSortDir("desc"), []);
  const handleSortClear = useCallback((): void => setSortDir(null), []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Card roundedAbove="sm">
        <BlockStack gap="400">
          {/* Toolbar */}
          <InlineStack align="space-between" blockAlign="center" wrap={false}>
            <Checkbox
              id="shipping-rates-enabled"
              label="Enable shipping rates"
              checked={enabled}
              onChange={setEnabled}
            />
            <ButtonGroup>
              <Button icon={ImportIcon} variant="secondary">
                Import from Shopify
              </Button>
              <Button variant="primary" onClick={openAdd}>
                Add rate
              </Button>
            </ButtonGroup>
          </InlineStack>

          {/* Table */}
          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            overflowX="hidden"
            overflowY="hidden"
          >
            {/* Header */}
            <Box
              paddingBlock="200"
              paddingInline="400"
              background="bg-surface-secondary"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 110px 1.2fr auto",
                  gap: "12px",
                }}
              >
                <Text as="span" variant="headingSm">
                  Rate name
                </Text>
                <Text as="span" variant="headingSm">
                  Price
                </Text>
                <Text as="span" variant="headingSm">
                  Condition
                </Text>
                {/* spacer for actions column */}
                <Box minWidth="64px" />
              </div>
            </Box>
            <Divider />

            {/* Rows */}
            {displayRates.length === 0 ? (
              <Box padding="600">
                <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                  No shipping rates yet. Click &quot;Add rate&quot; to get started.
                </Text>
              </Box>
            ) : (
              displayRates.map((rate) => (
                <RateRow
                  key={rate.id}
                  rate={rate}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))
            )}

            {/* Sort footer */}
            <Box paddingBlock="300" paddingInline="400">
              <InlineStack align="start" blockAlign="center" gap="300">
                <Text as="span" variant="bodySm" tone="subdued">
                  Sort rates by price
                </Text>
                <ButtonGroup variant="segmented">
                  <Button
                    size="slim"
                    icon={ChevronUpIcon}
                    pressed={sortDir === "asc"}
                    onClick={handleSortAsc}
                    accessibilityLabel="Sort ascending"
                  />
                  <Button
                    size="slim"
                    icon={ChevronDownIcon}
                    pressed={sortDir === "desc"}
                    onClick={handleSortDesc}
                    accessibilityLabel="Sort descending"
                  />
                  <Button
                    size="slim"
                    icon={XIcon}
                    disabled={sortDir === null}
                    onClick={handleSortClear}
                    accessibilityLabel="Clear sort"
                  />
                </ButtonGroup>
              </InlineStack>
            </Box>
          </Box>

          {/* Learn more */}
          <Box paddingBlockEnd="200">
            <Text as="p" variant="bodySm" alignment="center" tone="subdued">
              Learn more about{" "}
              <Link
                url="https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/shipping-rates"
                external
              >
                Shipping rates
              </Link>
            </Text>
          </Box>
        </BlockStack>
      </Card>

      {/* Add / Edit modal */}
      <RateModal
        open={modalOpen}
        isEditing={editingId !== null}
        draft={draft}
        onChange={setDraftField}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  );
}
