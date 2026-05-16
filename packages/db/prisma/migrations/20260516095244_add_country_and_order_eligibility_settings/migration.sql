-- AlterTable
ALTER TABLE "FormDesignConfig" ADD COLUMN     "allowedCountries" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "ineligibleMessage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "orderEligibilityMax" DECIMAL(10,2),
ADD COLUMN     "orderEligibilityMin" DECIMAL(10,2),
ADD COLUMN     "showIneligibleMessage" BOOLEAN NOT NULL DEFAULT false;
