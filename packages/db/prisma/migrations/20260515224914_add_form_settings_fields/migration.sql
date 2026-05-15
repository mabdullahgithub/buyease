/*
  Warnings:

  - You are about to alter the column `pricePerMessage` on the `WhatsAppGlobalConfig` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "FormDesignConfig" ADD COLUMN     "allowCountriesOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "countries" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "countriesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customCss" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "disableAllDiscounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disableInPages" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "disableOutOfStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disableShopifyDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableOrderEligibility" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formPlacement" TEXT NOT NULL DEFAULT 'whole-store',
ADD COLUMN     "hideAddToCart" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideBuyNow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideCheckout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideSubmitButton" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productRestrictionMode" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "restrictedCollections" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "restrictedProducts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "whenOpened" TEXT NOT NULL DEFAULT 'product-and-cart';

-- AlterTable
ALTER TABLE "GoogleSheetsIntegration" ADD COLUMN     "abandonedSheetName" TEXT NOT NULL DEFAULT 'Orders',
ADD COLUMN     "autoSync" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "importPreset" TEXT NOT NULL DEFAULT 'Custom',
ADD COLUMN     "insertAtTop" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layoutDesign" TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN     "selectedFields" JSONB,
ADD COLUMN     "singleRowPerOrder" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MerchantSettings" ADD COLUMN     "abandonedCartDelayMinutes" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "MerchantWhatsAppConfig" ADD COLUMN     "abandonedCartDelayMinutes" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "WhatsAppGlobalConfig" ALTER COLUMN "pricePerMessage" SET DEFAULT 5,
ALTER COLUMN "pricePerMessage" SET DATA TYPE DECIMAL(10,4);

-- CreateTable
CREATE TABLE "FormConfigChangeLog" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "configType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormConfigChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessagingSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "shopName" TEXT NOT NULL DEFAULT 'Product Store',
    "otpActive" BOOLEAN NOT NULL DEFAULT true,
    "otpMessage" TEXT NOT NULL DEFAULT 'Your verification code is {otp}',
    "orderConfirmationActive" BOOLEAN NOT NULL DEFAULT false,
    "orderConfirmationMessage" TEXT NOT NULL DEFAULT 'Thanks for your purchase from {shop_name} {order_url}',
    "shippingConfirmationActive" BOOLEAN NOT NULL DEFAULT false,
    "shippingConfirmationMessage" TEXT NOT NULL DEFAULT 'Your order has been shipped from {shop_name} - Track your order at {tracking_url}',
    "abandonedCartActive" BOOLEAN NOT NULL DEFAULT false,
    "abandonedCartMessage" TEXT NOT NULL DEFAULT 'We noticed you left something in your cart at {shop_name}. Don''t miss out, finish your purchase today! {recovery_url}',
    "abandonedCartAutoOpen" BOOLEAN NOT NULL DEFAULT false,
    "otpVerificationCode" TEXT NOT NULL DEFAULT 'Verify your phone number to complete your order',
    "otpDescription" TEXT NOT NULL DEFAULT 'We''ve sent a verification code via {channel} to your phone number {phone}. Please enter the code below to verify your number and complete your order',
    "otpVerifyButton" TEXT NOT NULL DEFAULT 'Verify',
    "otpResend" TEXT NOT NULL DEFAULT 'Resend code',
    "otpChangeNumber" TEXT NOT NULL DEFAULT 'Change number',
    "otpInvalidCode" TEXT NOT NULL DEFAULT 'The code you entered is invalid.',
    "otpCodeSent" TEXT NOT NULL DEFAULT 'A new verification code has been sent to your mobile number.',
    "otpResentAttempts" TEXT NOT NULL DEFAULT 'You''ve exceeded the maximum number of attempts.',
    "otpAskBeforeCreating" BOOLEAN NOT NULL DEFAULT false,
    "otpMaxAttempts" TEXT NOT NULL DEFAULT '3',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessagingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormConfigChangeLog_shop_idx" ON "FormConfigChangeLog"("shop");

-- CreateIndex
CREATE INDEX "FormConfigChangeLog_configType_idx" ON "FormConfigChangeLog"("configType");

-- CreateIndex
CREATE INDEX "FormConfigChangeLog_createdAt_idx" ON "FormConfigChangeLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessagingSettings_shop_key" ON "MessagingSettings"("shop");

-- CreateIndex
CREATE INDEX "MessagingSettings_shop_idx" ON "MessagingSettings"("shop");

-- AddForeignKey
ALTER TABLE "MessagingSettings" ADD CONSTRAINT "MessagingSettings_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
