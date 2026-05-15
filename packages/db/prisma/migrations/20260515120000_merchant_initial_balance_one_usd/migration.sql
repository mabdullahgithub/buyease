-- Add balance column to Merchant table
ALTER TABLE "Merchant" ADD COLUMN "balance" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- One-time: grant $1 to existing merchants still at zero (welcome credit rollout).
UPDATE "Merchant" SET "balance" = 1 WHERE "balance" = 0;
