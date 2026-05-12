-- CreateEnum
CREATE TYPE "WhatsAppProvider" AS ENUM ('TWILIO', 'WHATSAPP_BUSINESS');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('ORDER_CONFIRMED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ABANDONED_CART');

-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "WhatsAppGlobalConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "provider" "WhatsAppProvider" NOT NULL DEFAULT 'TWILIO',
    "accountSid" TEXT,
    "authToken" TEXT,
    "senderNumber" TEXT,
    "pricePerMessage" INTEGER NOT NULL DEFAULT 5,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppGlobalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantWhatsAppConfig" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "recipientNumber" TEXT,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "notifyOrderConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderShipped" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderDelivered" BOOLEAN NOT NULL DEFAULT false,
    "notifyAbandonedCart" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantWhatsAppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "orderId" TEXT,
    "messageType" "WhatsAppMessageType" NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'PENDING',
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantWhatsAppConfig_shop_key" ON "MerchantWhatsAppConfig"("shop");

-- CreateIndex
CREATE INDEX "MerchantWhatsAppConfig_shop_idx" ON "MerchantWhatsAppConfig"("shop");

-- CreateIndex
CREATE INDEX "MerchantWhatsAppConfig_isEnabled_idx" ON "MerchantWhatsAppConfig"("isEnabled");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_shop_idx" ON "WhatsAppMessage"("shop");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_status_idx" ON "WhatsAppMessage"("status");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_messageType_idx" ON "WhatsAppMessage"("messageType");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_createdAt_idx" ON "WhatsAppMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "MerchantWhatsAppConfig" ADD CONSTRAINT "MerchantWhatsAppConfig_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_shop_fkey" FOREIGN KEY ("shop") REFERENCES "MerchantWhatsAppConfig"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;
