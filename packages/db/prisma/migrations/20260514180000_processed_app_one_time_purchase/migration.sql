-- Idempotency for messaging top-up credits (return URL + app_purchases_one_time/update webhook).
CREATE TABLE "ProcessedAppOneTimePurchase" (
    "purchaseGid" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedAppOneTimePurchase_pkey" PRIMARY KEY ("purchaseGid")
);

CREATE INDEX "ProcessedAppOneTimePurchase_shop_idx" ON "ProcessedAppOneTimePurchase"("shop");
