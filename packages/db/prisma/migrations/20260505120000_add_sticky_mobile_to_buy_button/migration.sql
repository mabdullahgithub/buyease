-- AlterTable
ALTER TABLE "BuyButtonConfig" ADD COLUMN "stickyMobile" BOOLEAN NOT NULL DEFAULT true;

-- Update stickyPosition default from 'none' to 'off' for new records
ALTER TABLE "BuyButtonConfig" ALTER COLUMN "stickyPosition" SET DEFAULT 'off';

-- Migrate existing data: rename 'none' to 'off' in stickyPosition
UPDATE "BuyButtonConfig" SET "stickyPosition" = 'off' WHERE "stickyPosition" = 'none';
