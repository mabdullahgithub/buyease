import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * E.164 phone number format: + followed by 1-15 digits.
 */
export const phoneE164 = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)");

export const email = z.string().trim().toLowerCase().email("Invalid email address").max(320);

/**
 * Shopify GID format: gid://shopify/{Resource}/{numericId}
 */
export const shopifyGid = z
  .string()
  .regex(
    /^gid:\/\/shopify\/[A-Za-z]+\/\d+$/,
    "Must be a valid Shopify GID (e.g. gid://shopify/Product/123)",
  );

export const shopDomain = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/, "Invalid Shopify domain");

export const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #FF0000)");

export const currencyCode = z
  .string()
  .length(3, "Currency code must be 3 characters")
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Must be a valid ISO 4217 currency code");

export const countryCode = z
  .string()
  .length(2, "Country code must be 2 characters")
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Must be a valid ISO 3166-1 alpha-2 country code");

export const provinceCode = z
  .string()
  .min(1)
  .max(6)
  .toUpperCase()
  .regex(/^[A-Z0-9-]+$/, "Must be a valid province/state code");

type FieldError = {
  field: string;
  message: string;
};

export function formatZodErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export function validationErrorResponse(error: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: formatZodErrors(error),
    },
    { status: 400 },
  );
}

export function parseBody<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, response: validationErrorResponse(result.error) };
  }
  return { success: true, data: result.data };
}
