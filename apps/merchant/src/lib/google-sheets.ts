import type { Order } from "@prisma/client";

import { getValidAccessToken } from "@/lib/google-oauth";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const FETCH_TIMEOUT_MS = 15_000;
const EXPORT_BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// Low-level Sheets REST helpers
// ---------------------------------------------------------------------------

async function sheetsRequest(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const url = path.startsWith("http") ? path : `${SHEETS_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets API error (${res.status}): ${body}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as unknown) : null;
}

// ---------------------------------------------------------------------------
// Mapping logic — converts Order to Sheet Row based on selectedFields
// ---------------------------------------------------------------------------

function getFieldData(order: Order, fieldName: string): string {
  const meta = (order.metadata as Record<string, unknown>) ?? {};

  const str = (v: unknown): string => (v != null ? String(v) : "");

  switch (fieldName) {
    case "Order number": return order.orderId;
    case "Order ID": return order.id;
    case "Creation date (YYYY-MM-DD)": return order.createdAt.toISOString().split("T")[0] ?? "";
    case "Date & Time": return order.createdAt.toISOString();
    case "First name": return order.customerName?.split(" ")[0] ?? "";
    case "Last name": return order.customerName?.split(" ").slice(1).join(" ") ?? "";
    case "Full name": return order.customerName ?? "";
    case "Company": return str(meta.company);
    case "Email": return order.customerEmail ?? "";
    case "Phone number": return order.customerPhone ?? "";
    case "Address": return str(meta.address1 || meta.address);
    case "Address 2": return str(meta.address2);
    case "City": return str(meta.city);
    case "Province": return str(meta.province);
    case "Zip code": return str(meta.zip);
    case "Country": return str(meta.country);
    case "Product name and variant": return str(meta.product_name_variant);
    case "Product name": return str(meta.product_name);
    case "Variant name": return str(meta.variant_name);
    case "Product quantity": return meta.quantity != null ? str(meta.quantity) : "1";
    case "Product SKU": return str(meta.sku);
    case "Product ID": return str(meta.product_id);
    case "Product vendor": return str(meta.vendor);
    case "Product price": return str(meta.price);
    case "Total price": return order.codAmount.toString();
    case "Order currency": return str(meta.currency) || "USD";
    case "Total weight (grams)": return meta.total_weight != null ? str(meta.total_weight) : "0";
    case "Shipping price": return meta.shipping_price != null ? str(meta.shipping_price) : "0";
    case "Shipping rate name": return str(meta.shipping_method);
    case "Total discounts": return meta.total_discounts != null ? str(meta.total_discounts) : "0";
    case "Discount codes applied": return str(meta.discount_codes);
    case "Order note": return str(meta.note);
    case "Order type (abandoned or normal)":
      return order.status === "PENDING" && meta.is_abandoned ? "abandoned" : "normal";
    case "UTM source": return str(meta.utm_source);
    case "UTM medium": return str(meta.utm_medium);
    case "UTM campaign": return str(meta.utm_campaign);
    case "UTM term": return str(meta.utm_term);
    case "UTM content": return str(meta.utm_content);
    case "Page URL": return str(meta.page_url);
    case "IP address": return str(meta.ip_address);
    case "Abandoned order recovery URL": return str(meta.recovery_url);
    case "Store domain (myshopify.com)": return str(meta.shop_domain);
    case "All order details (in one cell)": return JSON.stringify(meta);
    default: return "";
  }
}

function orderToRow(order: Order, selectedFields: string[]): string[] {
  return selectedFields.filter((f) => f !== "").map((f) => getFieldData(order, f));
}

// Returns one row per order when singleRowPerOrder=true, or one row per line
// item when singleRowPerOrder=false. Falls back to a single row when the order
// has no line_items array in its metadata (BuyEase single-item COD orders).
function getOrderRows(order: Order, selectedFields: string[], singleRowPerOrder: boolean): string[][] {
  if (singleRowPerOrder) return [orderToRow(order, selectedFields)];

  const meta = (order.metadata as Record<string, unknown>) ?? {};
  const lineItems = Array.isArray(meta.line_items)
    ? (meta.line_items as Record<string, unknown>[])
    : [];

  if (lineItems.length === 0) return [orderToRow(order, selectedFields)];

  return lineItems.map((item) =>
    orderToRow({ ...order, metadata: { ...meta, ...item } } as Order, selectedFields),
  );
}

// ---------------------------------------------------------------------------
// Spreadsheet management
// ---------------------------------------------------------------------------

type SpreadsheetInfo = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
};

export async function createSpreadsheet(
  accessToken: string,
  title: string,
): Promise<SpreadsheetInfo> {
  const data = (await sheetsRequest(accessToken, "", {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
      sheets: [{ properties: { title: "Orders" } }],
    }),
  })) as { spreadsheetId: string; spreadsheetUrl: string; properties: { title: string } };

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: data.properties.title,
  };
}

export async function getSpreadsheetTitle(
  accessToken: string,
  spreadsheetId: string,
): Promise<string> {
  const data = (await sheetsRequest(
    accessToken,
    `/${spreadsheetId}?fields=properties.title`,
  )) as { properties: { title: string } };
  return data.properties.title;
}

export async function getSheetTabs(
  accessToken: string,
  spreadsheetId: string,
): Promise<string[]> {
  const data = (await sheetsRequest(
    accessToken,
    `/${spreadsheetId}?fields=sheets.properties.title`,
  )) as { sheets: Array<{ properties: { title: string } }> };
  return data.sheets.map((s) => s.properties.title);
}

const SHEET_THEMES: Record<string, { headerBg: string; headerText: string; row1Bg: string; row2Bg: string }> = {
  "Standard": { headerBg: "#FFFFFF", headerText: "#5C5F62", row1Bg: "#FFFFFF", row2Bg: "#FFFFFF" },
  "Sunset (Orange)": { headerBg: "#D35400", headerText: "#FFFFFF", row1Bg: "#FFF8F0", row2Bg: "#FFFFFF" },
  "With Headers": { headerBg: "#F4F6F8", headerText: "#202223", row1Bg: "#FFFFFF", row2Bg: "#FFFFFF" },
  "Minimal": { headerBg: "#FFFFFF", headerText: "#202223", row1Bg: "#FFFFFF", row2Bg: "#FAFAFA" },
  "Professional (Dark)": { headerBg: "#202223", headerText: "#FFFFFF", row1Bg: "#FFFFFF", row2Bg: "#FAFAFA" },
  "Slate (Gray)": { headerBg: "#5C5F62", headerText: "#FFFFFF", row1Bg: "#FFFFFF", row2Bg: "#F4F6F8" },
  "Colorful (Purple)": { headerBg: "#5C6AC4", headerText: "#FFFFFF", row1Bg: "#F4F5FA", row2Bg: "#FFFFFF" },
  "Ocean (Cyan)": { headerBg: "#00A0AC", headerText: "#FFFFFF", row1Bg: "#E0F5F5", row2Bg: "#FFFFFF" },
  "Forest (Green)": { headerBg: "#50B83C", headerText: "#FFFFFF", row1Bg: "#EBF5EB", row2Bg: "#FFFFFF" },
  "Rose (Pink)": { headerBg: "#F49342", headerText: "#FFFFFF", row1Bg: "#FDF4EC", row2Bg: "#FFFFFF" },
  "Gold (Yellow)": { headerBg: "#EEC200", headerText: "#202223", row1Bg: "#FCF9E8", row2Bg: "#FFFFFF" },
};

function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { red: r, green: g, blue: b };
}

export async function applySheetDesign(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  designName: string = "Standard",
): Promise<void> {
  const theme = SHEET_THEMES[designName] ?? SHEET_THEMES["Standard"]!;

  const spreadsheet = (await sheetsRequest(
    accessToken,
    `/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
  )) as { sheets: Array<{ properties: { sheetId: number; title: string } }> };

  const sheet = spreadsheet.sheets.find(
    (s) => s.properties.title.trim().toLowerCase() === sheetName.trim().toLowerCase(),
  );
  if (!sheet) return;

  const sheetId = sheet.properties.sheetId;

  const requests = [
    // 1. Apply header row styling (background + text)
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 26 },
        cell: {
          userEnteredFormat: {
            backgroundColor: hexToRgb(theme.headerBg),
            textFormat: { foregroundColor: hexToRgb(theme.headerText), bold: true, fontSize: 10 },
            horizontalAlignment: "LEFT",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
      },
    },
    // 2. Apply base background for rows 2-1000
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 26 },
        cell: { userEnteredFormat: { backgroundColor: hexToRgb(theme.row1Bg) } },
        fields: "userEnteredFormat.backgroundColor",
      },
    },
    // 3. Alternate even rows via conditional formatting
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 26 }],
          booleanRule: {
            condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: "=ISEVEN(ROW())" }] },
            format: { backgroundColor: hexToRgb(theme.row2Bg) },
          },
        },
        index: 0,
      },
    },
  ];

  await sheetsRequest(accessToken, `/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
}

export async function ensureHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  selectedFields: string[] | null = null,
  designName: string = "Standard",
): Promise<void> {
  const header = (
    selectedFields ?? ["Order number", "Order ID", "Date", "Status", "Customer Name", "Customer Phone", "Customer Email", "Total Price", "Order Details"]
  ).filter((f) => f !== "");
  if (header.length === 0) return;

  const range = encodeURIComponent(`${sheetName}!A1`);
  await sheetsRequest(accessToken, `/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [header] }),
  });

  await applySheetDesign(accessToken, spreadsheetId, sheetName, designName);
}

// ---------------------------------------------------------------------------
// Row Operations
// ---------------------------------------------------------------------------

export async function appendOrderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  order: Order,
  selectedFields: string[],
  insertAtTop: boolean = false,
  singleRowPerOrder: boolean = true,
): Promise<void> {
  const rows = getOrderRows(order, selectedFields, singleRowPerOrder);

  if (insertAtTop) {
    try {
      const spreadsheet = (await sheetsRequest(
        accessToken,
        `/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
      )) as { sheets: Array<{ properties: { sheetId: number; title: string } }> };
      const sheet = spreadsheet.sheets.find((s) => s.properties.title === sheetName);
      if (sheet) {
        // Insert exactly as many rows as we need to write (≥1), then overwrite
        // starting at A2 so the new order(s) land just below the header.
        await sheetsRequest(accessToken, `/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                insertDimension: {
                  range: {
                    sheetId: sheet.properties.sheetId,
                    dimension: "ROWS",
                    startIndex: 1,
                    endIndex: 1 + rows.length,
                  },
                  inheritFromBefore: false,
                },
              },
            ],
          }),
        });
        const range = encodeURIComponent(`${sheetName}!A2`);
        await sheetsRequest(accessToken, `/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
          method: "PUT",
          body: JSON.stringify({ values: rows }),
        });
        return;
      }
    } catch {
      // Fallback to append at bottom if batchUpdate fails
    }
  }

  const range = encodeURIComponent(`${sheetName}!A:A`);
  await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: rows }),
    },
  );
}

export async function syncOrderToSheet(
  shop: string,
  order: Order,
  mode: "create" | "update" = "create",
): Promise<void> {
  const { db } = await import("@buyease/db");

  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop },
  });

  if (!integration?.isEnabled || !integration.spreadsheetId) return;
  if (!integration.autoSync) return;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(shop);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Token refresh failed";
    await db.googleSheetsIntegration.update({
      where: { shop },
      data: { lastSyncError: msg },
    });
    return;
  }

  // Choose sheet based on order type
  const meta = (order.metadata as Record<string, unknown>) ?? {};
  const isAbandoned = order.status === "PENDING" && Boolean(meta.is_abandoned);
  const sheetName = isAbandoned ? integration.abandonedSheetName : integration.sheetName;

  const selectedFields = (integration.selectedFields as string[]) ?? [];

  // Atomic header-row guard: only write the header once, even under concurrent
  // webhooks. We attempt an atomic DB update first; if it returns 0 updated rows
  // another concurrent call already claimed it.
  if (!integration.headerRowWritten) {
    const claimed = await db.googleSheetsIntegration.updateMany({
      where: { shop, headerRowWritten: false },
      data: { headerRowWritten: true },
    });
    if (claimed.count > 0) {
      await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.sheetName, selectedFields, integration.layoutDesign);
      if (integration.abandonedSheetName !== integration.sheetName) {
        await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.abandonedSheetName, selectedFields, integration.layoutDesign);
      }
    }
  }

  await appendOrderRow(
    accessToken,
    integration.spreadsheetId,
    sheetName,
    order,
    selectedFields,
    integration.insertAtTop,
    integration.singleRowPerOrder,
  );

  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { lastSyncAt: new Date(), lastSyncError: null },
  });
}

export async function exportAllOrdersToSheet(shop: string): Promise<{ count: number }> {
  const { db } = await import("@buyease/db");

  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop },
  });

  if (!integration?.spreadsheetId) {
    throw new Error("No spreadsheet configured");
  }

  const accessToken = await getValidAccessToken(shop);
  const selectedFields = (integration.selectedFields as string[]) ?? [];
  const insertAtTop = integration.insertAtTop;
  const singleRowPerOrder = integration.singleRowPerOrder;

  // Write headers
  await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.sheetName, selectedFields, integration.layoutDesign);
  if (integration.abandonedSheetName !== integration.sheetName) {
    await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.abandonedSheetName, selectedFields, integration.layoutDesign);
  }

  // Stream orders in batches to avoid loading the full table into memory.
  // Track per-sheet row offsets independently — abandoned and normal orders go
  // to different tabs so their row counts must not be conflated.
  let cursor: string | undefined;
  let normalRowOffset = 0;
  let abandonedRowOffset = 0;
  let totalCount = 0;

  do {
    const batch = await db.order.findMany({
      where: { shopId: shop },
      orderBy: { createdAt: insertAtTop ? "desc" : "asc" },
      take: EXPORT_BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (batch.length === 0) break;

    cursor = batch[batch.length - 1]!.id;
    totalCount += batch.length;

    const normalRows: string[][] = [];
    const abandonedRows: string[][] = [];

    for (const order of batch) {
      const isAbandoned = Boolean((order.metadata as Record<string, unknown>)?.is_abandoned);
      const rows = getOrderRows(order, selectedFields, singleRowPerOrder);
      if (isAbandoned) {
        abandonedRows.push(...rows);
      } else {
        normalRows.push(...rows);
      }
    }

    // Flush each batch to Sheets using the correct per-sheet row offset.
    if (normalRows.length > 0) {
      const startRow = 2 + normalRowOffset;
      const range = encodeURIComponent(`${integration.sheetName}!A${startRow}`);
      await sheetsRequest(
        accessToken,
        `/${integration.spreadsheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: "PUT",
          body: JSON.stringify({ values: normalRows }),
        },
      );
      normalRowOffset += normalRows.length;
    }

    if (abandonedRows.length > 0 && integration.abandonedSheetName !== integration.sheetName) {
      const startRow = 2 + abandonedRowOffset;
      const range = encodeURIComponent(`${integration.abandonedSheetName}!A${startRow}`);
      await sheetsRequest(
        accessToken,
        `/${integration.spreadsheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: "PUT",
          body: JSON.stringify({ values: abandonedRows }),
        },
      );
      abandonedRowOffset += abandonedRows.length;
    }
  } while (cursor);

  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { lastSyncAt: new Date(), lastSyncError: null, headerRowWritten: true },
  });

  return { count: totalCount };
}
