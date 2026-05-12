-- CreateTable
CREATE TABLE "GoogleSheetsIntegration" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiresAt" TIMESTAMP(3),
    "googleEmail" TEXT,
    "spreadsheetId" TEXT,
    "spreadsheetUrl" TEXT,
    "sheetName" TEXT NOT NULL DEFAULT 'Orders',
    "headerRowWritten" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSheetsIntegration_shop_key" ON "GoogleSheetsIntegration"("shop");

-- CreateIndex
CREATE INDEX "GoogleSheetsIntegration_shop_idx" ON "GoogleSheetsIntegration"("shop");

-- CreateIndex
CREATE INDEX "GoogleSheetsIntegration_isEnabled_idx" ON "GoogleSheetsIntegration"("isEnabled");

-- AddForeignKey
ALTER TABLE "GoogleSheetsIntegration" ADD CONSTRAINT "GoogleSheetsIntegration_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
