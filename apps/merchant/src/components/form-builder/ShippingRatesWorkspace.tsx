"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormLayout,
  Icon,
  InlineStack,
  Modal,
  Select,
  SkeletonBodyText,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import {
  CartIcon,
  CashDollarIcon,
  ChatIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
  GlobeIcon,
  ImportIcon,
  PackageIcon,
  PlusIcon,
  ProductIcon,
  SearchIcon,
  XIcon,
} from "@shopify/polaris-icons";
import { SaveBar } from "@shopify/app-bridge-react";

import type {
  ConditionType,
  RateCondition,
  ShippingRate,
} from "@/components/form-builder/shipping-rates-types";
import {
  CONDITION_SHORT_LABELS,
  CONDITION_TYPE_OPTIONS,
  CONDITION_VALUE_LABELS,
  createCondition,
  createEmptyRate,
} from "@/components/form-builder/shipping-rates-types";
import { SHIPPING_COUNTRIES } from "@/components/form-builder/shipping-rates-countries";
import { useShopifyBridge } from "@/lib/use-shopify-bridge";

/** Maps each condition type to a unique Polaris icon for visual identification. */
const CONDITION_ICONS: Record<ConditionType, IconSource> = {
  order_total_gte: CashDollarIcon,
  order_total_lte: CashDollarIcon,
  order_weight_gte: PackageIcon,
  order_weight_lte: PackageIcon,
  quantity_gte: CartIcon,
  quantity_lte: CartIcon,
  cart_contains: ProductIcon,
  cart_not_contains: XIcon,
};

/** Each condition type gets a unique badge tone for instant visual distinction. */
const CONDITION_BADGE_TONES: Record<ConditionType, "info" | "success" | "warning" | "attention" | "new" | "critical" | "read-only" | "enabled"> = {
  order_total_gte: "info",
  order_total_lte: "new",
  order_weight_gte: "warning",
  order_weight_lte: "attention",
  quantity_gte: "success",
  quantity_lte: "enabled",
  cart_contains: "read-only",
  cart_not_contains: "critical",
};

/** Quick-start rate templates — pre-filled examples merchants can add with one click. */
const QUICK_START_TEMPLATES = [
  { category: "Standard", rates: [
    { name: "Standard Shipping", price: "5.99", description: "5-7 business days" },
    { name: "Express Shipping",  price: "12.99", description: "2-3 business days" },
    { name: "Free Shipping",     price: "0.00",  description: "Free for all orders" },
  ]},
  { category: "International", rates: [
    { name: "International Standard", price: "15.99", description: "10-15 business days" },
    { name: "International Express",  price: "29.99", description: "5-7 business days" },
  ]},
];

type ApiCondition = {
  type: ConditionType;
  value: number | string;
};

type ApiShippingRate = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  conditions: ApiCondition[];
  countriesEnabled: boolean;
  countries: string[];
  provincesEnabled: boolean;
  provinces: string[];
  importedFromShopify: boolean;
  isActive: boolean;
  sortOrder: number;
};

function toApiPayload(rates: ShippingRate[]): unknown[] {
  return rates.map((r) => ({
    id: r.id.startsWith("rate-") ? undefined : r.id,
    name: r.name,
    description: r.description || undefined,
    price: parseFloat(r.price) || 0,
    currency: r.currency,
    conditions: r.conditions.map((c) => ({
      type: c.type,
      value: isNaN(Number(c.value)) ? c.value : Number(c.value),
    })),
    countriesEnabled: r.countryRestrictionEnabled,
    countries: r.selectedCountries,
    provincesEnabled: r.provinceRestrictionEnabled,
    provinces: r.selectedProvinces,
    importedFromShopify: r.importedFromShopify,
    isActive: r.isActive,
  }));
}

function fromApiResponse(apiRates: ApiShippingRate[]): ShippingRate[] {
  return apiRates.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    price: String(r.price),
    currency: r.currency,
    conditions: (r.conditions as ApiCondition[]).map((c) => ({
      id: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: c.type,
      value: String(c.value),
    })),
    countryRestrictionEnabled: r.countriesEnabled,
    selectedCountries: r.countries as string[],
    provinceRestrictionEnabled: r.provincesEnabled,
    selectedProvinces: r.provinces as string[],
    isEditing: false,
    importedFromShopify: r.importedFromShopify,
    isActive: r.isActive,
  }));
}

function stripEditingState(rates: ShippingRate[]): Omit<ShippingRate, "isEditing">[] {
  return rates.map(({ isEditing: _, ...rest }) => rest);
}

function detectContradictions(conditions: RateCondition[]): string | null {
  const bounds: Record<string, { gte?: number; lt?: number }> = {
    order_total: {}, order_weight: {}, quantity: {},
  };
  for (const c of conditions) {
    const num = Number(c.value);
    if (!Number.isFinite(num)) continue;
    if      (c.type === "order_total_gte")  bounds.order_total!.gte  = num;
    else if (c.type === "order_total_lte")  bounds.order_total!.lt   = num;
    else if (c.type === "order_weight_gte") bounds.order_weight!.gte = num;
    else if (c.type === "order_weight_lte") bounds.order_weight!.lt  = num;
    else if (c.type === "quantity_gte")     bounds.quantity!.gte     = num;
    else if (c.type === "quantity_lte")     bounds.quantity!.lt      = num;
  }
  const LABELS: Record<string, string> = {
    order_total: "Order total", order_weight: "Order weight", quantity: "Quantity",
  };
  for (const [dim, b] of Object.entries(bounds)) {
    if (b.gte !== undefined && b.lt !== undefined && b.gte >= b.lt) {
      return `${LABELS[dim]} cannot satisfy both ≥ ${b.gte} and < ${b.lt} simultaneously — this rate will never apply.`;
    }
  }
  return null;
}

function ConditionBadges({ conditions }: { conditions: RateCondition[] }): ReactElement {
  if (conditions.length === 0) {
    return (
      <InlineStack gap="100" blockAlign="center">
        <Icon source={GlobeIcon} tone="subdued" />
        <Text as="span" variant="bodySm" tone="subdued">No condition, always visible.</Text>
      </InlineStack>
    );
  }
  return (
    <InlineStack gap="100" wrap>
      {conditions.map((c) => (
        <Tooltip key={c.id} content={`${CONDITION_SHORT_LABELS[c.type]} ${c.value}`}>
          <Badge tone={CONDITION_BADGE_TONES[c.type]} icon={CONDITION_ICONS[c.type]}>
            {`${CONDITION_SHORT_LABELS[c.type]} ${c.value}`}
          </Badge>
        </Tooltip>
      ))}
    </InlineStack>
  );
}

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
}: {
  condition: RateCondition;
  onUpdate: (id: string, patch: Partial<RateCondition>) => void;
  onRemove: (id: string) => void;
}): ReactElement {
  return (
    <InlineStack gap="300" blockAlign="end" wrap={false}>
      <Box minWidth="280px">
        <Select
          label="Condition type"
          options={CONDITION_TYPE_OPTIONS}
          value={condition.type}
          onChange={(v) => onUpdate(condition.id, { type: v as ConditionType })}
        />
      </Box>
      <Box minWidth="140px">
        <TextField
          label={CONDITION_VALUE_LABELS[condition.type]}
          value={condition.value}
          autoComplete="off"
          onChange={(v) => onUpdate(condition.id, { value: v })}
        />
      </Box>
      <Button icon={DeleteIcon} tone="critical" variant="plain" onClick={() => onRemove(condition.id)} accessibilityLabel="Remove condition" />
    </InlineStack>
  );
}

function CountrySelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (codes: string[]) => void;
}): ReactElement {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => SHIPPING_COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const toggle = useCallback(
    (code: string) => {
      onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
    },
    [selected, onChange],
  );

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodySm" fontWeight="semibold">Select countries</Text>
      <TextField
        label="Search countries"
        labelHidden
        value={search}
        onChange={setSearch}
        autoComplete="off"
        placeholder="Search countries"
        prefix={<Icon source={SearchIcon} />}
        clearButton
        onClearButtonClick={() => setSearch("")}
      />
      <Box borderWidth="025" borderColor="border" borderRadius="200" padding="200">
        <div style={{ overflowY: "auto", maxHeight: "180px" }}>
        <BlockStack gap="100">
          {filtered.length === 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">No countries match your search.</Text>
          ) : (
            filtered.map((country) => (
              <Checkbox
                key={country.code}
                label={`${country.name} (${country.code})`}
                checked={selected.includes(country.code)}
                onChange={() => toggle(country.code)}
              />
            ))
          )}
        </BlockStack>
        </div>
      </Box>
      {selected.length > 0 && (
        <InlineStack gap="100" wrap>
          {selected.map((code) => {
            const country = SHIPPING_COUNTRIES.find((c) => c.code === code);
            return (
              <Badge key={code} tone="info">
                {country?.name ?? code}
              </Badge>
            );
          })}
        </InlineStack>
      )}
    </BlockStack>
  );
}

function ProvinceSelector({
  selectedCountries,
  selectedProvinces,
  onChange,
}: {
  selectedCountries: string[];
  selectedProvinces: string[];
  onChange: (codes: string[]) => void;
}): ReactElement {
  const [search, setSearch] = useState("");

  const availableProvinces = useMemo(() => {
    const result: { countryCode: string; countryName: string; provinceCode: string; provinceName: string; fullCode: string }[] = [];
    for (const cc of selectedCountries) {
      const country = SHIPPING_COUNTRIES.find((c) => c.code === cc);
      if (country) {
        for (const prov of country.provinces) {
          const full = `${cc}-${prov.code}`;
          if (!search || prov.name.toLowerCase().includes(search.toLowerCase()) || country.name.toLowerCase().includes(search.toLowerCase())) {
            result.push({ countryCode: cc, countryName: country.name, provinceCode: prov.code, provinceName: prov.name, fullCode: full });
          }
        }
      }
    }
    return result;
  }, [selectedCountries, search]);

  const toggle = useCallback(
    (fullCode: string) => {
      onChange(selectedProvinces.includes(fullCode) ? selectedProvinces.filter((p) => p !== fullCode) : [...selectedProvinces, fullCode]);
    },
    [selectedProvinces, onChange],
  );

  if (selectedCountries.length === 0) {
    return <Text as="p" variant="bodySm" tone="subdued">Enable country restriction first to select provinces/states.</Text>;
  }

  const countriesWithProvinces = selectedCountries.filter((cc) => {
    const c = SHIPPING_COUNTRIES.find((x) => x.code === cc);
    return c && c.provinces.length > 0;
  });

  if (countriesWithProvinces.length === 0) {
    return <Text as="p" variant="bodySm" tone="subdued">Selected countries have no province/state data available.</Text>;
  }

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodySm" fontWeight="semibold">Select provinces / states</Text>
      <TextField
        label="Search provinces"
        labelHidden
        value={search}
        onChange={setSearch}
        autoComplete="off"
        placeholder="Search provinces / states"
        prefix={<Icon source={SearchIcon} />}
        clearButton
        onClearButtonClick={() => setSearch("")}
      />
      <Box borderWidth="025" borderColor="border" borderRadius="200" padding="200">
        <div style={{ overflowY: "auto", maxHeight: "200px" }}>
        <BlockStack gap="200">
          {availableProvinces.length === 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">No provinces match your search.</Text>
          ) : (
            availableProvinces.map((p) => (
              <Checkbox
                key={p.fullCode}
                label={`${p.provinceName} — ${p.countryName}`}
                checked={selectedProvinces.includes(p.fullCode)}
                onChange={() => toggle(p.fullCode)}
              />
            ))
          )}
        </BlockStack>
        </div>
      </Box>
      {selectedProvinces.length > 0 && (
        <InlineStack gap="100" wrap>
          {selectedProvinces.map((fc) => {
            const [cc, pc] = fc.split("-");
            const country = SHIPPING_COUNTRIES.find((c) => c.code === cc);
            const province = country?.provinces.find((p) => p.code === pc);
            const label = province && country
              ? `${province.name} — ${country.name}`
              : fc;
            return <Badge key={fc} tone="success">{label}</Badge>;
          })}
        </InlineStack>
      )}
    </BlockStack>
  );
}

function RateEditForm({
  rate,
  onUpdate,
}: {
  rate: ShippingRate;
  onUpdate: (patch: Partial<ShippingRate>) => void;
}): ReactElement {
  const updateCondition = useCallback(
    (condId: string, patch: Partial<RateCondition>) => {
      onUpdate({ conditions: rate.conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)) });
    },
    [rate.conditions, onUpdate],
  );

  const removeCondition = useCallback(
    (condId: string) => {
      onUpdate({ conditions: rate.conditions.filter((c) => c.id !== condId) });
    },
    [rate.conditions, onUpdate],
  );

  return (
    <Box padding="400" background="bg-surface-secondary" borderRadius="200">
      <BlockStack gap="400">
        <FormLayout>
          <FormLayout.Group>
            <TextField label="Rate name" value={rate.name} onChange={(v) => onUpdate({ name: v })} autoComplete="off" placeholder="e.g. Standard Shipping" />
            <TextField label="Rate description" value={rate.description} onChange={(v) => onUpdate({ description: v })} autoComplete="off" placeholder="e.g. 5-7 business days" />
          </FormLayout.Group>
          <FormLayout.Group>
            <Select
              label="Currency"
              options={[
                { label: "USD — US Dollar",           value: "USD" },
                { label: "EUR — Euro",                value: "EUR" },
                { label: "GBP — British Pound",       value: "GBP" },
                { label: "AED — UAE Dirham",          value: "AED" },
                { label: "SAR — Saudi Riyal",         value: "SAR" },
                { label: "PKR — Pakistani Rupee",     value: "PKR" },
                { label: "INR — Indian Rupee",        value: "INR" },
                { label: "CAD — Canadian Dollar",     value: "CAD" },
                { label: "AUD — Australian Dollar",   value: "AUD" },
                { label: "EGP — Egyptian Pound",      value: "EGP" },
                { label: "MAD — Moroccan Dirham",     value: "MAD" },
                { label: "TRY — Turkish Lira",        value: "TRY" },
                { label: "BRL — Brazilian Real",      value: "BRL" },
                { label: "MXN — Mexican Peso",        value: "MXN" },
                { label: "JPY — Japanese Yen",        value: "JPY" },
              ]}
              value={rate.currency}
              onChange={(v) => onUpdate({ currency: v })}
            />
            <TextField label="Rate price" value={rate.price} onChange={(v) => onUpdate({ price: v })} autoComplete="off" type="number" prefix={rate.currency} min={0} step={0.01} />
          </FormLayout.Group>
        </FormLayout>

        <Divider />

        <BlockStack gap="300">
          <Text as="h3" variant="headingSm">Rate conditions</Text>
          {rate.conditions.map((cond) => (
            <ConditionRow key={cond.id} condition={cond} onUpdate={updateCondition} onRemove={removeCondition} />
          ))}
          <Box>
            <Button icon={PlusIcon} onClick={() => onUpdate({ conditions: [...rate.conditions, createCondition()] })}>
              Add condition
            </Button>
          </Box>
        </BlockStack>

        <Divider />

        <Checkbox
          label="Enable this rate only for specific countries"
          checked={rate.countryRestrictionEnabled}
          onChange={(v) => onUpdate({ countryRestrictionEnabled: v })}
        />
        {rate.countryRestrictionEnabled && (
          <CountrySelector selected={rate.selectedCountries} onChange={(v) => onUpdate({ selectedCountries: v })} />
        )}

        <Checkbox
          label="Enable this rate only for specific provinces / states"
          checked={rate.provinceRestrictionEnabled}
          onChange={(v) => onUpdate({ provinceRestrictionEnabled: v })}
        />
        {rate.provinceRestrictionEnabled && (
          <ProvinceSelector
            selectedCountries={rate.countryRestrictionEnabled ? rate.selectedCountries : SHIPPING_COUNTRIES.map((c) => c.code)}
            selectedProvinces={rate.selectedProvinces}
            onChange={(v) => onUpdate({ selectedProvinces: v })}
          />
        )}
      </BlockStack>
    </Box>
  );
}

export function ShippingRatesWorkspace(): ReactElement {
  const shopify = useShopifyBridge();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSelections, setImportSelections] = useState<Record<string, boolean>>({});
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const savedRatesRef = useRef<ShippingRate[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRates(): Promise<void> {
      try {
        const response = await fetch("/api/shipping-rates", {
          headers: {
            Authorization: `Bearer ${await shopify.idToken()}`,
          },
        });

        if (cancelled) return;

        if (response.ok) {
          const data: ApiShippingRate[] = await response.json();
          const mapped = fromApiResponse(data);
          setRates(mapped);
          savedRatesRef.current = mapped;
        } else {
          setError("Failed to load shipping rates.");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to connect. Please check your connection and reload.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRates();
    return () => { cancelled = true; };
  }, [shopify]);

  useEffect(() => {
    if (loading) return;
    const saved = savedRatesRef.current;
    if (!saved) {
      setDirty(true);
      return;
    }
    const isDirty = JSON.stringify(stripEditingState(rates)) !== JSON.stringify(stripEditingState(saved));
    setDirty(isDirty);
  }, [loading, rates]);

  const handleSave = useCallback(async (): Promise<void> => {
    for (const rate of rates) {
      const contradiction = detectContradictions(rate.conditions);
      if (contradiction) {
        setError(`"${rate.name || "Untitled"}": ${contradiction}`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const payload = { rates: toApiPayload(rates) };
      const response = await fetch("/api/shipping-rates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await shopify.idToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: ApiShippingRate[] = await response.json();
        const mapped = fromApiResponse(data);
        setRates(mapped);
        savedRatesRef.current = mapped;
        setDirty(false);
        shopify.toast.show("Shipping rates saved successfully");
      } else {
        const err = await response.json().catch(() => null);
        const msg = err?.details?.[0]?.message ?? err?.error ?? "Save failed. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Unable to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [shopify, rates]);

  const handleDiscard = useCallback((): void => {
    if (savedRatesRef.current) {
      setRates(savedRatesRef.current);
    }
    setDirty(false);
    setError(null);
  }, []);

  const updateRate = useCallback((rateId: string, patch: Partial<ShippingRate>) => {
    setRates((prev) => prev.map((r) => (r.id === rateId ? { ...r, ...patch } : r)));
  }, []);

  const deleteRate = useCallback((rateId: string) => {
    setRates((prev) => prev.filter((r) => r.id !== rateId));
  }, []);

  const addRate = useCallback(() => {
    setRates((prev) => [...prev, createEmptyRate()]);
  }, []);

  const saveRate = useCallback((rateId: string) => {
    setRates((prev) => prev.map((r) => (r.id === rateId ? { ...r, isEditing: false } : r)));
  }, []);

  const handleImport = useCallback(() => {
    const imported: ShippingRate[] = [];
    for (const group of QUICK_START_TEMPLATES) {
      for (const r of group.rates) {
        const key = `${group.category}-${r.name}`;
        if (importSelections[key]) {
          imported.push({
            ...createEmptyRate(),
            name: r.name,
            description: r.description,
            price: r.price,
            isEditing: false,
            importedFromShopify: false,
          });
        }
      }
    }
    if (imported.length > 0) {
      setRates((prev) => [...prev, ...imported]);
    }
    setImportModalOpen(false);
    setImportSelections({});
  }, [importSelections]);

  const toggleImportSelection = useCallback((key: string) => {
    setImportSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const selectAllImports = useCallback(() => {
    const all: Record<string, boolean> = {};
    for (const group of QUICK_START_TEMPLATES) {
      for (const r of group.rates) {
        all[`${group.category}-${r.name}`] = true;
      }
    }
    setImportSelections(all);
  }, []);

  const selectedImportCount = Object.values(importSelections).filter(Boolean).length;

  if (loading) {
    return (
      <Box width="100%">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <SkeletonBodyText lines={2} />
          </Card>
          <Card roundedAbove="sm" padding="0">
            <Box padding="400">
              <InlineStack gap="200">
                <Box minWidth="110px"><SkeletonBodyText lines={1} /></Box>
                <Box minWidth="160px"><SkeletonBodyText lines={1} /></Box>
              </InlineStack>
            </Box>
            <Divider />
            <Box paddingInline="400" paddingBlock="300" background="bg-surface-secondary">
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
              </div>
            </Box>
            <Divider />
            <BlockStack gap="0">
              {[0, 1, 2].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider />}
                  <Box paddingInline="400" paddingBlock="300">
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                    </div>
                  </Box>
                </Box>
              ))}
            </BlockStack>
          </Card>
        </BlockStack>
      </Box>
    );
  }

  return (
    <BlockStack gap="400">
      <SaveBar id="shipping-rates-save-bar" open={dirty}>
        <button variant="primary" onClick={handleSave} disabled={saving} loading={saving} />
        <button onClick={handleDiscard} disabled={saving} />
      </SaveBar>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          <Text as="p" variant="bodyMd">{error}</Text>
        </Banner>
      )}

      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd">
            On this section you can create the shipping rates for your form. <Text as="span" fontWeight="bold">All prices will use your store currency.</Text>
          </Text>
        </BlockStack>
      </Card>

      <Card roundedAbove="sm" padding="0">
        <Box padding="400">
          <InlineStack gap="200">
            <Button variant="primary" icon={PlusIcon} onClick={addRate}>Add rate</Button>
            <Button icon={ImportIcon} onClick={() => setImportModalOpen(true)}>Quick start templates</Button>
          </InlineStack>
        </Box>

        <Divider />

        {/* Table header */}
        <Box paddingInline="400" paddingBlock="300" background="bg-surface-secondary">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
            <Text as="span" variant="headingSm">Name</Text>
            <Text as="span" variant="headingSm">Price</Text>
            <Text as="span" variant="headingSm">Status</Text>
            <Text as="span" variant="headingSm">Condition</Text>
            <Text as="span" variant="headingSm" alignment="end">Actions</Text>
          </div>
        </Box>

        <Divider />

        {/* Table rows */}
        {rates.length === 0 ? (
          <Box padding="600">
            <BlockStack gap="200" inlineAlign="center">
              <Icon source={PackageIcon} tone="subdued" />
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">No shipping rates configured yet. Add a rate or import from Shopify.</Text>
            </BlockStack>
          </Box>
        ) : (
          <BlockStack gap="0">
            {rates.map((rate, idx) => (
              <Box key={rate.id}>
                {idx > 0 && <Divider />}
                <Box paddingInline="400" paddingBlock="300">
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {rate.name || <Text as="span" tone="subdued" variant="bodyMd">Untitled</Text>}
                      </Text>
                      {rate.importedFromShopify && <Badge tone="info">Shopify</Badge>}
                    </InlineStack>
                    <Text as="span" variant="bodyMd">
                      {parseFloat(rate.price) === 0 ? "Free" : `${rate.currency} ${parseFloat(rate.price).toFixed(2)}`}
                    </Text>
                    {/* Active / Inactive toggle pill */}
                    <div>
                      <button
                        type="button"
                        onClick={() => updateRate(rate.id, { isActive: !rate.isActive })}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 9px 3px 6px", borderRadius: "10px", border: "none",
                          background: rate.isActive ? "#e8f5e9" : "#f3f4f6",
                          cursor: "pointer", userSelect: "none",
                          fontSize: "12px", fontWeight: 600,
                          color: rate.isActive ? "#2e7d32" : "#6d7175",
                          transition: "background 0.15s",
                        }}
                        title={rate.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: rate.isActive ? "#4caf50" : "#babec3",
                          transition: "background 0.15s",
                        }} />
                        {rate.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <ConditionBadges conditions={rate.conditions} />
                    <InlineStack gap="200" align="end">
                      {rate.isEditing ? (
                        <Button icon={CheckIcon} variant="primary" size="slim" onClick={() => saveRate(rate.id)} accessibilityLabel="Save rate" />
                      ) : (
                        <Button icon={EditIcon} size="slim" onClick={() => updateRate(rate.id, { isEditing: true })} accessibilityLabel="Edit rate" />
                      )}
                      <Button icon={DeleteIcon} tone="critical" size="slim" onClick={() => deleteRate(rate.id)} accessibilityLabel="Delete rate" />
                    </InlineStack>
                  </div>
                </Box>

                {rate.isEditing && (
                  <Box paddingInline="400" paddingBlockEnd="400">
                    <RateEditForm rate={rate} onUpdate={(patch) => updateRate(rate.id, patch)} />
                  </Box>
                )}
              </Box>
            ))}
          </BlockStack>
        )}
      </Card>

      {showInfoBanner && (
        <Banner
          tone="info"
          icon={ChatIcon}
          title="Do you need more specific conditions?"
          onDismiss={() => setShowInfoBanner(false)}
          action={{ content: "Contact us", url: "mailto:support@buyease.com" }}
        >
          <Text as="p" variant="bodyMd">
            If you need more specialized customization for your shipping rates, please don't hesitate to reach out. We'd be happy to incorporate any conditions you require into your order form.
          </Text>
        </Banner>
      )}

      {/* Import from Shopify Modal */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Quick start templates"
        primaryAction={{ content: `Add ${selectedImportCount} rate${selectedImportCount !== 1 ? "s" : ""}`, onAction: handleImport, disabled: selectedImportCount === 0 }}
        secondaryActions={[
          { content: "Select all", onAction: selectAllImports },
          { content: "Cancel", onAction: () => setImportModalOpen(false) },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
              Select ready-made rate templates to add to your form. All rates are fully editable after adding — update names, prices, and conditions to match your store.
            </Text>
            {QUICK_START_TEMPLATES.map((group) => (
              <BlockStack key={group.category} gap="200">
                <Text as="h3" variant="headingSm">{group.category}</Text>
                {group.rates.map((r) => {
                  const key = `${group.category}-${r.name}`;
                  return (
                    <Box key={key} padding="200" borderWidth="025" borderColor="border" borderRadius="200">
                      <Checkbox
                        label={
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="span" variant="bodyMd" fontWeight="semibold">{r.name}</Text>
                            <Text as="span" variant="bodySm" tone="subdued">{`— ${r.description}`}</Text>
                            <Badge>{`$${r.price}`}</Badge>
                          </InlineStack>
                        }
                        checked={Boolean(importSelections[key])}
                        onChange={() => toggleImportSelection(key)}
                      />
                    </Box>
                  );
                })}
              </BlockStack>
            ))}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
