-- AlterTable
ALTER TABLE "FormDesignConfig" ADD COLUMN     "googleAcAutoLocate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleAcCountries" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "googleAcFillCity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleAcFillCountry" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleAcFillPostalCode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleAcFillProvince" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleAcLanguage" TEXT,
ADD COLUMN     "googleAcMapPicker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleAcPlaceType" TEXT NOT NULL DEFAULT 'address',
ADD COLUMN     "googleAutocomplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GoogleAutocompleteGlobalConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "apiKey" TEXT,
    "pricePerSession" DECIMAL(10,4) NOT NULL DEFAULT 0.05,
    "pricePerGeocode" DECIMAL(10,4) NOT NULL DEFAULT 0.01,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAutocompleteGlobalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAutocompleteUsageLog" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleAutocompleteUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAutocompleteUsageLog_shop_idx" ON "GoogleAutocompleteUsageLog"("shop");

-- CreateIndex
CREATE INDEX "GoogleAutocompleteUsageLog_createdAt_idx" ON "GoogleAutocompleteUsageLog"("createdAt");

-- AddForeignKey
ALTER TABLE "GoogleAutocompleteUsageLog" ADD CONSTRAINT "GoogleAutocompleteUsageLog_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
