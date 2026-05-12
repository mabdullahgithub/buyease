import type { Order } from "@prisma/client";

import { getValidAccessToken } from "@/lib/google-oauth";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// Sheet column layout — fixed order, matches HEADER_ROW below
const HEADER_ROW = [
  "BuyEase ID",
  "Shopify Order ID",
  "Date",
  "Status",
  "Customer Name",
  "Customer Phone",
  "Customer Email",
  "COD Amount",
  "Form Data",
];

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

// ---------------------------------------------------------------------------
// Header row
// ---------------------------------------------------------------------------

async function readCell(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  cell: string,
): Promise<string> {
  const range = encodeURIComponent(`${sheetName}!${cell}`);
  const data = (await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}`,
  )) as { values?: string[][] };
  return data.values?.[0]?.[0] ?? "";
}

export async function ensureHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
): Promise<void> {
  const a1 = await readCell(accessToken, spreadsheetId, sheetName, "A1");
  if (a1 === HEADER_ROW[0]) return;

  const range = encodeURIComponent(`${sheetName}!A1`);
  await sheetsRequest(accessToken, `/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [HEADER_ROW] }),
  });
}

// ---------------------------------------------------------------------------
// Row serialisation
// ---------------------------------------------------------------------------

function formatFormData(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  return Object.entries(metadata as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" | ");
}

function orderToRow(order: Order): string[] {
  return [
    order.id,
    order.orderId,
    order.createdAt.toISOString(),
    order.status,
    order.customerName ?? "",
    order.customerPhone ?? "",
    order.customerEmail ?? "",
    order.codAmount.toString(),
    formatFormData(order.metadata),
  ];
}

// ---------------------------------------------------------------------------
// Append a new row
// ---------------------------------------------------------------------------

export async function appendOrderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  order: Order,
): Promise<void> {
  const range = encodeURIComponent(`${sheetName}!A:A`);
  await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [orderToRow(order)] }),
    },
  );
}

// ---------------------------------------------------------------------------
// Find the row index of an existing order by BuyEase ID (column A)
// Returns 1-based row number, or null if not found
// ---------------------------------------------------------------------------

async function findOrderRowIndex(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  buyeaseOrderId: string,
): Promise<number | null> {
  const range = encodeURIComponent(`${sheetName}!A:A`);
  const data = (await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}`,
  )) as { values?: string[][] };

  const rows = data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0] === buyeaseOrderId) return i + 1; // 1-based
  }
  return null;
}

// ---------------------------------------------------------------------------
// Update an existing row's status (and full row data)
// ---------------------------------------------------------------------------

export async function updateOrderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  order: Order,
): Promise<void> {
  const rowIndex = await findOrderRowIndex(
    accessToken,
    spreadsheetId,
    sheetName,
    order.id,
  );

  if (!rowIndex) {
    // Row not found — append instead of failing silently
    await appendOrderRow(accessToken, spreadsheetId, sheetName, order);
    return;
  }

  const range = encodeURIComponent(`${sheetName}!A${rowIndex}`);
  await sheetsRequest(
    accessToken,
    `/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [orderToRow(order)] }),
    },
  );
}

// ---------------------------------------------------------------------------
// Sync a single order — upsert logic (append or update)
// ---------------------------------------------------------------------------

export async function syncOrderToSheet(
  shop: string,
  order: Order,
  mode: "create" | "update" = "create",
): Promise<void> {
  const { db } = await import("@buyease/db");

  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop },
    select: {
      isEnabled: true,
      spreadsheetId: true,
      sheetName: true,
      headerRowWritten: true,
    },
  });

  if (!integration?.isEnabled || !integration.spreadsheetId) return;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(shop);
  } catch {
    return;
  }

  const sheetName = integration.sheetName;

  if (!integration.headerRowWritten) {
    await ensureHeaderRow(accessToken, integration.spreadsheetId, sheetName);
    await db.googleSheetsIntegration.update({
      where: { shop },
      data: { headerRowWritten: true },
    });
  }

  if (mode === "create") {
    await appendOrderRow(accessToken, integration.spreadsheetId, sheetName, order);
  } else {
    await updateOrderRow(accessToken, integration.spreadsheetId, sheetName, order);
  }

  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { lastSyncAt: new Date(), lastSyncError: null },
  });
}

// ---------------------------------------------------------------------------
// Bulk export — writes all orders for a shop to the sheet
// ---------------------------------------------------------------------------

export async function exportAllOrdersToSheet(shop: string): Promise<{ count: number }> {
  const { db } = await import("@buyease/db");

  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop },
    select: { isEnabled: true, spreadsheetId: true, sheetName: true },
  });

  if (!integration?.spreadsheetId) {
    throw new Error("No spreadsheet configured");
  }

  const accessToken = await getValidAccessToken(shop);
  const sheetName = integration.sheetName;

  // Write header unconditionally to ensure it's correct
  await ensureHeaderRow(accessToken, integration.spreadsheetId, sheetName);
  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { headerRowWritten: true },
  });

  const orders = await db.order.findMany({
    where: { shopId: shop },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) return { count: 0 };

  // Write all rows in a single batch append
  const rows = orders.map(orderToRow);
  const range = encodeURIComponent(`${sheetName}!A2`);
  await sheetsRequest(
    accessToken,
    `/${integration.spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: rows }),
    },
  );

  await db.googleSheetsIntegration.update({
    where: { shop },
    data: { lastSyncAt: new Date(), lastSyncError: null },
  });

  return { count: orders.length };
}
