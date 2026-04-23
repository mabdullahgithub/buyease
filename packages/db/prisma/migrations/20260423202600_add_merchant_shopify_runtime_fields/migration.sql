-- Added merchant runtime fields for Shopify app session and billing state.
ALTER TABLE "Merchant"
ADD COLUMN "accessToken" TEXT,
ADD COLUMN "refreshToken" TEXT,
ADD COLUMN "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "scopes" TEXT,
ADD COLUMN "planBillingId" TEXT,
ADD COLUMN "billingCycleStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "ordersThisCycle" INTEGER NOT NULL DEFAULT 0;
