import crypto from "crypto";

/**
 * Formats a numeric amount as a currency string.
 * @param amount - The numeric value to format
 * @param currency - ISO 4217 currency code (e.g. "USD", "EUR")
 * @param locale - BCP 47 locale string (defaults to "en-US")
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a Date object or ISO date string into a human-readable string.
 * @param date - Date object or ISO 8601 string
 * @param locale - BCP 47 locale string (defaults to "en-US")
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
  date: Date | string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Calculates the COD fee for an order.
 * @param orderAmount - The total order amount in smallest currency unit or decimal
 * @param feePercent - The fee percentage (e.g. 2.5 for 2.5%)
 * @returns The fee amount rounded to 2 decimal places
 */
export function calculateCODFee(
  orderAmount: number,
  feePercent: number
): number {
  return Math.round(orderAmount * (feePercent / 100) * 100) / 100;
}

/**
 * Verifies a Shopify webhook HMAC signature.
 * @param rawBody - The raw request body string
 * @param secret - The webhook secret from Shopify partner dashboard
 * @param receivedHmac - The X-Shopify-Hmac-SHA256 header value
 * @returns true if the signature is valid
 */
export function verifyShopifyWebhookHmac(
  rawBody: string,
  secret: string,
  receivedHmac: string
): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const computedBuffer = Buffer.from(computed);
  const receivedBuffer = Buffer.from(receivedHmac);

  if (computedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(computedBuffer, receivedBuffer);
}

/**
 * Generates a Shopify webhook HMAC signature (for testing/internal use).
 * @param body - The request body string
 * @param secret - The webhook secret
 */
export function generateShopifyWebhookHmac(
  body: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
}

type PaginateResult<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/**
 * Paginates an array of items.
 * @param array - The full array to paginate
 * @param page - The current page (1-indexed)
 * @param perPage - The number of items per page
 */
export function paginate<T>(
  array: T[],
  page: number,
  perPage: number
): PaginateResult<T> {
  const total = array.length;
  const totalPages = Math.ceil(total / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  return {
    data: array.slice(start, end),
    total,
    page: currentPage,
    perPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Slugifies a string for use in URLs.
 * @param text - The string to slugify
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates a string to a maximum length, appending an ellipsis.
 * @param str - The string to truncate
 * @param maxLength - Maximum allowed length including ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Returns a Shopify shop domain from a full URL or bare domain.
 * @param input - e.g. "https://my-store.myshopify.com" or "my-store.myshopify.com"
 */
export function normalizeShopDomain(input: string): string {
  const cleaned = input.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return cleaned.toLowerCase();
}
