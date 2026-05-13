import type { Order } from "@prisma/client";

import { getValidAccessToken } from "@/lib/google-oauth";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

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
  const meta = (order.metadata as any) || {};
  
  switch (fieldName) {
    case "Order number": return order.orderId;
    case "Order ID": return order.id;
    case "Creation date (YYYY-MM-DD)": return order.createdAt.toISOString().split('T')[0];
    case "Date & Time": return order.createdAt.toISOString();
    case "First name": return order.customerName?.split(' ')[0] || "";
    case "Last name": return order.customerName?.split(' ').slice(1).join(' ') || "";
    case "Full name": return order.customerName || "";
    case "Company": return meta.company || "";
    case "Email": return order.customerEmail || "";
    case "Phone number": return order.customerPhone || "";
    case "Address": return meta.address1 || meta.address || "";
    case "Address 2": return meta.address2 || "";
    case "City": return meta.city || "";
    case "Province": return meta.province || "";
    case "Zip code": return meta.zip || "";
    case "Country": return meta.country || "";
    case "Product name and variant": return meta.product_name_variant || "";
    case "Product name": return meta.product_name || "";
    case "Variant name": return meta.variant_name || "";
    case "Product quantity": return meta.quantity?.toString() || "1";
    case "Product SKU": return meta.sku || "";
    case "Product ID": return meta.product_id || "";
    case "Product vendor": return meta.vendor || "";
    case "Product price": return meta.price?.toString() || "";
    case "Total price": return order.codAmount.toString();
    case "Order currency": return meta.currency || "USD";
    case "Total weight (grams)": return meta.total_weight?.toString() || "0";
    case "Shipping price": return meta.shipping_price?.toString() || "0";
    case "Shipping rate name": return meta.shipping_method || "";
    case "Total discounts": return meta.total_discounts?.toString() || "0";
    case "Discount codes applied": return meta.discount_codes || "";
    case "Order note": return meta.note || "";
    case "Order type (abandoned or normal)": return order.status === "PENDING" && meta.is_abandoned ? "abandoned" : "normal";
    case "UTM source": return meta.utm_source || "";
    case "UTM medium": return meta.utm_medium || "";
    case "UTM campaign": return meta.utm_campaign || "";
    case "UTM term": return meta.utm_term || "";
    case "UTM content": return meta.utm_content || "";
    case "Page URL": return meta.page_url || "";
    case "IP address": return meta.ip_address || "";
    case "Abandoned order recovery URL": return meta.recovery_url || "";
    case "Store domain (myshopify.com)": return meta.shop_domain || "";
    case "All order details (in one cell)": return JSON.stringify(meta);
    default: return "";
  }
}

function orderToRow(order: Order, selectedFields: string[]): string[] {
  // Filter out empty fields and map them
  return selectedFields
    .filter(f => f !== "")
    .map(f => getFieldData(order, f));
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

const SHEET_THEMES: Record<string, any> = {
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

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { red: r, green: g, blue: b };
}

export async function applySheetDesign(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  designName: string = "Standard"
): Promise<void> {
  const theme = SHEET_THEMES[designName] || SHEET_THEMES["Standard"];
  
  try {
    const spreadsheet = (await sheetsRequest(accessToken, `/${spreadsheetId}?fields=sheets(properties(sheetId,title))`)) as { sheets: Array<{ properties: { sheetId: number, title: string } }> };
    const sheet = spreadsheet.sheets.find(s => s.properties.title.trim().toLowerCase() === sheetName.trim().toLowerCase());
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
              horizontalAlignment: "LEFT"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      },
      // 2. Apply zebra striping for rows 2-1000 using basic repeatCell (more reliable than alternating groups)
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 26 },
          cell: { userEnteredFormat: { backgroundColor: hexToRgb(theme.row1Bg) } },
          fields: "userEnteredFormat.backgroundColor"
        }
      },
      // 3. Apply alternate background for even rows using a conditional rule (highest compatibility)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 26 }],
            booleanRule: {
              condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: "=ISEVEN(ROW())" }] },
              format: { backgroundColor: hexToRgb(theme.row2Bg) }
            }
          },
          index: 0
        }
      }
    ];

    await sheetsRequest(accessToken, `/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ requests })
    });
  } catch (e) {
    console.error("Failed to apply sheet design:", e);
  }
}

export async function ensureHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  selectedFields: string[] | null = null,
  designName: string = "Standard"
): Promise<void> {
  const header = (selectedFields || ["Order number", "Order ID", "Date", "Status", "Customer Name", "Customer Phone", "Customer Email", "Total Price", "Order Details"]).filter(f => f !== "");
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
): Promise<void> {
  const row = orderToRow(order, selectedFields);
  
  if (insertAtTop) {
    // To insert at top, we first insert an empty row at index 1 (under header)
    // and then write the values to A2.
    // This requires getting the sheetId first.
    try {
      const spreadsheet = (await sheetsRequest(accessToken, `/${spreadsheetId}?fields=sheets(properties(sheetId,title))`)) as { sheets: Array<{ properties: { sheetId: number, title: string } }> };
      const sheet = spreadsheet.sheets.find(s => s.properties.title === sheetName);
      if (sheet) {
        await sheetsRequest(accessToken, `/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                insertDimension: {
                  range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
                  inheritFromBefore: false
                }
              }
            ]
          })
        });
        const range = encodeURIComponent(`${sheetName}!A2`);
        await sheetsRequest(accessToken, `/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
          method: "PUT",
          body: JSON.stringify({ values: [row] })
        });
        return;
      }
    } catch (e) {
      // Fallback to append if batchUpdate fails
    }
  }

  const range = encodeURIComponent(`${sheetName}!A:A`);
  await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [row] }),
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
  if (!integration.autoSync && mode === "create") return;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(shop);
  } catch {
    return;
  }

  // Choose sheet based on order type
  const meta = (order.metadata as any) || {};
  const isAbandoned = order.status === "PENDING" && meta.is_abandoned;
  const sheetName = isAbandoned ? integration.abandonedSheetName : integration.sheetName;

  const selectedFields = integration.selectedFields as string[] || [];

  if (!integration.headerRowWritten) {
    await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.sheetName, selectedFields, integration.layoutDesign);
    if (integration.abandonedSheetName !== integration.sheetName) {
      await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.abandonedSheetName, selectedFields, integration.layoutDesign);
    }
    await db.googleSheetsIntegration.update({
      where: { shop },
      data: { headerRowWritten: true },
    });
  }

  if (mode === "create") {
    await appendOrderRow(accessToken, integration.spreadsheetId, sheetName, order, selectedFields, integration.insertAtTop);
  } else {
    // For update, we would need to find the row. 
    // To keep it simple and functional for initial sync:
    await appendOrderRow(accessToken, integration.spreadsheetId, sheetName, order, selectedFields, integration.insertAtTop);
  }

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
  const selectedFields = integration.selectedFields as string[] || [];

  // Write headers
  await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.sheetName, selectedFields, integration.layoutDesign);
  if (integration.abandonedSheetName !== integration.sheetName) {
    await ensureHeaderRow(accessToken, integration.spreadsheetId, integration.abandonedSheetName, selectedFields, integration.layoutDesign);
  }

  const orders = await db.order.findMany({
    where: { shopId: shop },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) return { count: 0 };

  const normalOrders = orders.filter(o => !((o.metadata as any)?.is_abandoned));
  const abandonedOrders = orders.filter(o => (o.metadata as any)?.is_abandoned);

  if (normalOrders.length > 0) {
    const rows = normalOrders.map(o => orderToRow(o, selectedFields));
    const range = encodeURIComponent(`${integration.sheetName}!A2`);
    await sheetsRequest(
      accessToken,
      `/${integration.spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: rows }),
      },
    );
  }

  if (abandonedOrders.length > 0 && integration.abandonedSheetName !== integration.sheetName) {
    const rows = abandonedOrders.map(o => orderToRow(o, selectedFields));
    const range = encodeURIComponent(`${integration.abandonedSheetName}!A2`);
    await sheetsRequest(
      accessToken,
      `/${integration.spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: rows }),
      },
    );
  }

  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { lastSyncAt: new Date(), lastSyncError: null, headerRowWritten: true },
  });

  return { count: orders.length };
}
