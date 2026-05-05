import { z } from "zod";

import { countryCode, hexColor, provinceCode } from "@/lib/validation";

export const buyButtonConfigSchema = z.object({
  buttonText: z.string().trim().min(1).max(100),
  buttonSubtitle: z.string().trim().max(200).optional(),
  iconId: z.string().max(50).optional(),
  iconAlign: z.enum(["start", "end"]).default("start"),
  showIcon: z.boolean().default(true),
  animation: z
    .enum(["none", "shake-lr", "shake-ud", "shake-bottom", "pulse", "bounce", "fanfare"])
    .default("none"),
  stickyPosition: z.enum(["off", "bottom", "top"]).default("off"),
  stickyMobile: z.boolean().default(true),
  mobileFullWidth: z.boolean().default(false),
  bgColor: hexColor.default("#000000"),
  textColor: hexColor.default("#FFFFFF"),
  borderColor: hexColor.default("#000000"),
  fontSizePx: z.number().int().min(12).max(28).default(16),
  borderRadiusPx: z.number().int().min(0).max(50).default(8),
  borderWidthPx: z.number().int().min(0).max(10).default(0),
  shadowStrength: z.number().int().min(0).max(24).default(0),
  isBold: z.boolean().default(false),
  isItalic: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export type BuyButtonConfigInput = z.infer<typeof buyButtonConfigSchema>;

const fieldTypeEnum = z.enum([
  "header",
  "cart",
  "summary",
  "shipping",
  "input",
  "checkbox",
  "submit",
  "textarea",
  "select",
  "radio",
]);

const formFieldSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().max(200),
  type: fieldTypeEnum,
  deletable: z.boolean(),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().optional(),
  iconId: z.string().max(50).optional(),
  hidden: z.boolean().optional(),
  options: z.array(z.string().max(200)).max(50).optional(),
  validation: z.enum(["none", "phone", "email", "number", "postalCode"]).optional(),
});

export type FormFieldInput = z.infer<typeof formFieldSchema>;

export const formDesignConfigSchema = z.object({
  formType: z.enum(["popup", "embedded"]).default("popup"),
  fields: z.array(formFieldSchema).min(1).max(100),
  formBgColor: hexColor.default("#FFFFFF"),
  formTextColor: hexColor.default("#000000"),
  formBorderColor: hexColor.default("#E5E5E5"),
  formBorderRadiusPx: z.number().int().min(0).max(50).default(12),
  formPaddingPx: z.number().int().min(0).max(60).default(24),
  fieldBgColor: hexColor.default("#FFFFFF"),
  fieldTextColor: hexColor.default("#000000"),
  fieldBorderColor: hexColor.default("#D1D5DB"),
  fieldBorderRadiusPx: z.number().int().min(0).max(30).default(6),
  fieldFontSizePx: z.number().int().min(12).max(24).default(14),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  hideLabels: z.boolean().default(false),
  rtl: z.boolean().default(false),
  autocomplete: z.boolean().default(true),
  errorRequired: z.string().max(200).default("This field is required"),
  errorInvalid: z.string().max(200).default("Please enter a valid value"),
  errorSoldOut: z.string().max(200).default("This product is sold out"),
  isVisible: z.boolean().default(true),
});

export type FormDesignConfigInput = z.infer<typeof formDesignConfigSchema>;

const conditionTypeEnum = z.enum([
  "order_total_gte",
  "order_total_lte",
  "order_weight_gte",
  "order_weight_lte",
  "quantity_gte",
  "quantity_lte",
  "cart_contains",
  "cart_not_contains",
]);

const shippingConditionSchema = z.object({
  type: conditionTypeEnum,
  value: z.union([z.number().min(0), z.string().min(1).max(255)]),
});

export const shippingRateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  price: z.number().min(0).max(999999),
  currency: z.string().length(3).toUpperCase().default("USD"),
  conditions: z.array(shippingConditionSchema).max(20).default([]),
  countriesEnabled: z.boolean().default(false),
  countries: z.array(countryCode).max(250).default([]),
  provincesEnabled: z.boolean().default(false),
  provinces: z.array(provinceCode).max(500).default([]),
  isActive: z.boolean().default(true),
});

export type ShippingRateInput = z.infer<typeof shippingRateSchema>;
