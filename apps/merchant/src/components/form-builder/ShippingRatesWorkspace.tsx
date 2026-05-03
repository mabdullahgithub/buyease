"use client";

import { useCallback, useMemo, useState } from "react";
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

/** Tone for condition badge based on type category. */
function conditionBadgeTone(type: ConditionType): "info" | "warning" | "success" | "attention" {
  if (type.startsWith("order_total")) return "info";
  if (type.startsWith("order_weight")) return "warning";
  if (type.startsWith("quantity")) return "success";
  return "attention";
}

/** Simulated Shopify shipping zones for import. */
const MOCK_SHOPIFY_ZONES = [
  { name: "Domestic", rates: [
    { name: "Standard Shipping", price: "5.99", description: "5-7 business days" },
    { name: "Express Shipping", price: "12.99", description: "2-3 business days" },
    { name: "Free Shipping", price: "0.00", description: "Orders over $50" },
  ]},
  { name: "International", rates: [
    { name: "International Standard", price: "15.99", description: "10-15 business days" },
    { name: "International Express", price: "29.99", description: "5-7 business days" },
  ]},
];

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
          <Badge tone={conditionBadgeTone(c.type)} icon={CONDITION_ICONS[c.type]}>
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
          {selectedProvinces.map((fc) => (
            <Badge key={fc} tone="success">{fc}</Badge>
          ))}
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
  const [rates, setRates] = useState<ShippingRate[]>([
    {
      ...createEmptyRate(),
      id: "default-free",
      name: "Free shipping",
      price: "0.00",
      isEditing: false,
    },
  ]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSelections, setImportSelections] = useState<Record<string, boolean>>({});
  const [showInfoBanner, setShowInfoBanner] = useState(true);

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
    for (const zone of MOCK_SHOPIFY_ZONES) {
      for (const r of zone.rates) {
        const key = `${zone.name}-${r.name}`;
        if (importSelections[key]) {
          imported.push({
            ...createEmptyRate(),
            name: r.name,
            description: r.description,
            price: r.price,
            isEditing: false,
            importedFromShopify: true,
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
    for (const zone of MOCK_SHOPIFY_ZONES) {
      for (const r of zone.rates) {
        all[`${zone.name}-${r.name}`] = true;
      }
    }
    setImportSelections(all);
  }, []);

  const selectedImportCount = Object.values(importSelections).filter(Boolean).length;

  return (
    <BlockStack gap="400">
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
            <Button icon={ImportIcon} onClick={() => setImportModalOpen(true)}>Import from Shopify</Button>
          </InlineStack>
        </Box>

        <Divider />

        {/* Table header */}
        <Box paddingInline="400" paddingBlock="300" background="bg-surface-secondary">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
            <Text as="span" variant="headingSm">Name</Text>
            <Text as="span" variant="headingSm">Price</Text>
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
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 3fr 120px", gap: "var(--p-space-300)", alignItems: "center" }}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {rate.name || <Text as="span" tone="subdued" variant="bodyMd">Untitled</Text>}
                      </Text>
                      {rate.importedFromShopify && <Badge tone="info">Shopify</Badge>}
                    </InlineStack>
                    <Text as="span" variant="bodyMd">{rate.price}</Text>
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
        title="Import shipping rates from Shopify"
        primaryAction={{ content: `Import ${selectedImportCount} rate${selectedImportCount !== 1 ? "s" : ""}`, onAction: handleImport, disabled: selectedImportCount === 0 }}
        secondaryActions={[
          { content: "Select all", onAction: selectAllImports },
          { content: "Cancel", onAction: () => setImportModalOpen(false) },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
              Select the shipping rates you'd like to import from your Shopify shipping zones. Imported rates are fully editable after import.
            </Text>
            {MOCK_SHOPIFY_ZONES.map((zone) => (
              <BlockStack key={zone.name} gap="200">
                <Text as="h3" variant="headingSm">{zone.name}</Text>
                {zone.rates.map((r) => {
                  const key = `${zone.name}-${r.name}`;
                  return (
                    <Box key={key} padding="200" borderWidth="025" borderColor="border" borderRadius="200">
                      <Checkbox
                        label={
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="span" variant="bodyMd" fontWeight="semibold">{r.name}</Text>
                            <Text as="span" variant="bodySm" tone="subdued">— {r.description}</Text>
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
