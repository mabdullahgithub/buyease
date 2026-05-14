-- New merchants get $1 welcome credit for messaging (existing rows unchanged).
ALTER TABLE "Merchant" ALTER COLUMN "balance" SET DEFAULT 1;

-- One-time: grant $1 to existing merchants still at zero (welcome credit rollout).
UPDATE "Merchant" SET "balance" = 1 WHERE "balance" = 0;
