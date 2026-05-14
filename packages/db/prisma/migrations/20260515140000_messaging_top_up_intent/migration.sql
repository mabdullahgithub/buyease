-- Pending SMS top-up: stores AppPurchaseOneTime id from mutation when returnUrl lacks charge_id.
CREATE TABLE "MessagingTopUpIntent" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "purchaseGid" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessagingTopUpIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MessagingTopUpIntent_purchaseGid_key" ON "MessagingTopUpIntent"("purchaseGid");

CREATE INDEX "MessagingTopUpIntent_shop_consumedAt_createdAt_idx" ON "MessagingTopUpIntent"("shop", "consumedAt", "createdAt");
