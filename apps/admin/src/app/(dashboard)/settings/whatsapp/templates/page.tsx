import { revalidatePath } from "next/cache";
import { db } from "@buyease/db";
import type { WhatsAppMessageType } from "@prisma/client";

import { requireAdminSession } from "@/lib/admin-session";
import { WhatsAppSubNav } from "../whatsapp-sub-nav";
import { TemplateEditor } from "./template-editor";

// ─── Available variables per message type ────────────────────────────────────

export const TYPE_VARIABLES: Record<WhatsAppMessageType, string[]> = {
  ORDER_CONFIRMED: ["customerName", "orderId", "shopName", "totalPrice"],
  ORDER_SHIPPED: ["orderId", "shopName", "trackingUrl", "carrierName"],
  ORDER_DELIVERED: ["orderId", "shopName", "customerName"],
  ABANDONED_CART: ["shopName", "cartUrl", "productNames"],
};

const DEFAULT_BODIES: Record<WhatsAppMessageType, string> = {
  ORDER_CONFIRMED:
    "Hi {{customerName}}! Your order #{{orderId}} from {{shopName}} has been confirmed. Total: {{totalPrice}}. Thank you for shopping with us!",
  ORDER_SHIPPED:
    "Good news! Your order #{{orderId}} from {{shopName}} has been shipped. Track your delivery: {{trackingUrl}}",
  ORDER_DELIVERED:
    "Your order #{{orderId}} from {{shopName}} has been delivered! We hope you love it. Thank you for your purchase.",
  ABANDONED_CART:
    "Hi! You left items in your cart at {{shopName}}. Complete your order here: {{cartUrl}}",
};

const DEFAULT_META_NAMES: Record<WhatsAppMessageType, string> = {
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ABANDONED_CART: "abandoned_cart_recovery",
};

const MESSAGE_TYPES: WhatsAppMessageType[] = [
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ABANDONED_CART",
];

// ─── Upsert defaults for any missing template rows ───────────────────────────

async function getOrCreateTemplates() {
  const existing = await db.whatsAppTemplate.findMany();
  const existingTypes = new Set(
    (existing as { messageType: WhatsAppMessageType }[]).map((t) => t.messageType),
  );

  const missing = MESSAGE_TYPES.filter((t) => !existingTypes.has(t));
  if (missing.length > 0) {
    await db.whatsAppTemplate.createMany({
      data: missing.map((messageType) => ({
        messageType,
        metaTemplateName: DEFAULT_META_NAMES[messageType],
        body: DEFAULT_BODIES[messageType],
        variables: TYPE_VARIABLES[messageType],
        isActive: true,
      })),
    });
  }

  return db.whatsAppTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });
}

// ─── Server action ────────────────────────────────────────────────────────────

async function saveTemplate(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const rawType = String(formData.get("messageType") ?? "").trim();
  if (!MESSAGE_TYPES.includes(rawType as WhatsAppMessageType)) {
    return { success: false, error: "Invalid message type." };
  }
  const messageType = rawType as WhatsAppMessageType;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { success: false, error: "Message body is required." };
  if (body.length > 1024) {
    return { success: false, error: "Message body must be 1,024 characters or less." };
  }

  const rawName = String(formData.get("metaTemplateName") ?? "").trim();
  const metaTemplateName =
    rawName.length > 0
      ? rawName.toLowerCase().replace(/[^a-z0-9_]/g, "_")
      : null;

  const isActive = formData.get("isActive") === "on";

  await db.whatsAppTemplate.upsert({
    where: { messageType },
    update: { body, metaTemplateName, isActive },
    create: {
      messageType,
      body,
      metaTemplateName,
      variables: TYPE_VARIABLES[messageType],
      isActive,
    },
  });

  revalidatePath("/settings/whatsapp/templates");
  return { success: true };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WhatsAppTemplatesPage() {
  await requireAdminSession();
  const templates = await getOrCreateTemplates();

  return (
    <div className="space-y-8">
      <WhatsAppSubNav />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Message templates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the WhatsApp message sent to customers for each event. Use{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">
            {"{{variable}}"}
          </code>{" "}
          placeholders — they are replaced with live order data at send time.
        </p>
      </div>

      <TemplateEditor templates={templates} saveAction={saveTemplate} />
    </div>
  );
}
