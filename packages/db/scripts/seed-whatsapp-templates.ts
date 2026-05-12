import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    messageType: "ORDER_CONFIRMED" as const,
    metaTemplateName: "order_confirmed",
    body: "Hi {{customerName}}! Your order #{{orderId}} from {{shopName}} has been confirmed. Total: {{totalPrice}}. Thank you for shopping with us!",
    variables: ["customerName", "orderId", "shopName", "totalPrice"],
    isActive: true,
  },
  {
    messageType: "ORDER_SHIPPED" as const,
    metaTemplateName: "order_shipped",
    body: "Good news! Your order #{{orderId}} from {{shopName}} has been shipped. Track your delivery: {{trackingUrl}}",
    variables: ["orderId", "shopName", "trackingUrl"],
    isActive: true,
  },
  {
    messageType: "ORDER_DELIVERED" as const,
    metaTemplateName: "order_delivered",
    body: "Your order #{{orderId}} from {{shopName}} has been delivered! We hope you love it. Thank you for your purchase.",
    variables: ["orderId", "shopName"],
    isActive: true,
  },
  {
    messageType: "ABANDONED_CART" as const,
    metaTemplateName: "abandoned_cart_recovery",
    body: "Hi! You left items in your cart at {{shopName}}. Complete your order here: {{cartUrl}}",
    variables: ["shopName", "cartUrl"],
    isActive: true,
  },
] as const;

async function main(): Promise<void> {
  console.log("Seeding WhatsApp templates...");

  for (const template of DEFAULT_TEMPLATES) {
    await prisma.whatsAppTemplate.upsert({
      where: { messageType: template.messageType },
      update: {},
      create: template,
    });
    console.log(`  ✓ ${template.messageType}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
