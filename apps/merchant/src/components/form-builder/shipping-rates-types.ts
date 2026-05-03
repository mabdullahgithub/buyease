/**
 * Shipping Rates type definitions for the COD form builder.
 * Each condition type maps to a unique Polaris icon for visual distinction.
 */

export type ConditionType =
  | "order_total_gte"
  | "order_total_lte"
  | "order_weight_gte"
  | "order_weight_lte"
  | "quantity_gte"
  | "quantity_lte"
  | "cart_contains"
  | "cart_not_contains";

export type RateCondition = {
  id: string;
  type: ConditionType;
  value: string;
};

export type ShippingRate = {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  conditions: RateCondition[];
  countryRestrictionEnabled: boolean;
  selectedCountries: string[];
  provinceRestrictionEnabled: boolean;
  selectedProvinces: string[];
  isEditing: boolean;
  /** Rates imported from Shopify are flagged so we can show provenance. */
  importedFromShopify: boolean;
};

export type CountryOption = {
  code: string;
  name: string;
  provinces: ProvinceOption[];
};

export type ProvinceOption = {
  code: string;
  name: string;
};

export const CONDITION_TYPE_OPTIONS: { label: string; value: ConditionType }[] = [
  { label: "Order total greater or equal than", value: "order_total_gte" },
  { label: "Order total less than", value: "order_total_lte" },
  { label: "Order weight greater or equal than", value: "order_weight_gte" },
  { label: "Order weight less than", value: "order_weight_lte" },
  { label: "Quantity of products is greater or equal than", value: "quantity_gte" },
  { label: "Quantity of products is less than", value: "quantity_lte" },
  { label: "Cart contains product", value: "cart_contains" },
  { label: "Cart does not contain product", value: "cart_not_contains" },
];

export const CONDITION_VALUE_LABELS: Record<ConditionType, string> = {
  order_total_gte: "Order total",
  order_total_lte: "Order total",
  order_weight_gte: "Weight (Kg)",
  order_weight_lte: "Weight (Kg)",
  quantity_gte: "Quantity of products",
  quantity_lte: "Quantity of products",
  cart_contains: "Product handle",
  cart_not_contains: "Product handle",
};

/** Short label used in the compact icon badge tooltip. */
export const CONDITION_SHORT_LABELS: Record<ConditionType, string> = {
  order_total_gte: "Total ≥",
  order_total_lte: "Total <",
  order_weight_gte: "Weight ≥",
  order_weight_lte: "Weight <",
  quantity_gte: "Qty ≥",
  quantity_lte: "Qty <",
  cart_contains: "Contains",
  cart_not_contains: "Excludes",
};

export function createEmptyRate(): ShippingRate {
  return {
    id: `rate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    description: "",
    price: "0.00",
    currency: "USD",
    conditions: [],
    countryRestrictionEnabled: false,
    selectedCountries: [],
    provinceRestrictionEnabled: false,
    selectedProvinces: [],
    isEditing: true,
    importedFromShopify: false,
  };
}

export function createCondition(): RateCondition {
  return {
    id: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "order_total_gte",
    value: "0.00",
  };
}
