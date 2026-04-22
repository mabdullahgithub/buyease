import { NextResponse } from "next/server";
import { db } from "@buyease/db";
import { authenticateEmbeddedRequest } from "@/lib/embedded-auth";

type SettingsPayload = {
  defaultCurrency: string;
  timezone: string;
  notificationEmail: string;
  webhookUrl: string;
};

const DEFAULTS: SettingsPayload = {
  defaultCurrency: "USD",
  timezone: "UTC",
  notificationEmail: "",
  webhookUrl: "",
};

const CURRENCY_RE = /^[A-Z]{3}$/;
const TIMEZONE_RE = /^[A-Za-z_+\-/0-9]{1,64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeShop(shop: string): string {
  return shop.trim().toLowerCase();
}

function toPayload(
  row: {
    defaultCurrency: string;
    timezone: string;
    notificationEmail: string | null;
    webhookUrl: string | null;
  } | null
): SettingsPayload {
  if (!row) return DEFAULTS;
  return {
    defaultCurrency: row.defaultCurrency || DEFAULTS.defaultCurrency,
    timezone: row.timezone || DEFAULTS.timezone,
    notificationEmail: row.notificationEmail ?? "",
    webhookUrl: row.webhookUrl ?? "",
  };
}

function validate(body: unknown): { ok: true; value: SettingsPayload } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body" };
  }
  const input = body as Record<string, unknown>;

  const defaultCurrency =
    typeof input.defaultCurrency === "string" ? input.defaultCurrency.trim().toUpperCase() : "";
  const timezone = typeof input.timezone === "string" ? input.timezone.trim() : "";
  const notificationEmailRaw =
    typeof input.notificationEmail === "string" ? input.notificationEmail.trim() : "";
  const webhookUrlRaw = typeof input.webhookUrl === "string" ? input.webhookUrl.trim() : "";

  if (!CURRENCY_RE.test(defaultCurrency)) {
    return { ok: false, error: "defaultCurrency must be a 3-letter ISO code" };
  }
  if (!TIMEZONE_RE.test(timezone)) {
    return { ok: false, error: "timezone has invalid characters" };
  }
  if (notificationEmailRaw.length > 0 && !EMAIL_RE.test(notificationEmailRaw)) {
    return { ok: false, error: "notificationEmail is not a valid email address" };
  }
  if (webhookUrlRaw.length > 0) {
    try {
      const url = new URL(webhookUrlRaw);
      if (url.protocol !== "https:") {
        return { ok: false, error: "webhookUrl must use https://" };
      }
    } catch {
      return { ok: false, error: "webhookUrl is not a valid URL" };
    }
  }

  return {
    ok: true,
    value: {
      defaultCurrency,
      timezone,
      notificationEmail: notificationEmailRaw,
      webhookUrl: webhookUrlRaw,
    },
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authenticated = await authenticateEmbeddedRequest(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shop = normalizeShop(authenticated.shop);

    const row = await db.merchantSettings.findUnique({
      where: { shop },
      select: {
        defaultCurrency: true,
        timezone: true,
        notificationEmail: true,
        webhookUrl: true,
      },
    });

    return NextResponse.json({ ok: true, shop, settings: toPayload(row) }, { status: 200 });
  } catch (error) {
    console.error("[api/settings][GET]", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authenticated = await authenticateEmbeddedRequest(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shop = normalizeShop(authenticated.shop);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = validate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await db.merchant.upsert({
      where: { shop },
      update: {},
      create: { shop, isActive: true },
    });

    const saved = await db.merchantSettings.upsert({
      where: { shop },
      update: result.value,
      create: { shop, ...result.value },
      select: {
        defaultCurrency: true,
        timezone: true,
        notificationEmail: true,
        webhookUrl: true,
      },
    });

    return NextResponse.json({ ok: true, shop, settings: toPayload(saved) }, { status: 200 });
  } catch (error) {
    console.error("[api/settings][POST]", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
