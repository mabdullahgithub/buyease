-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorEnabledAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecretEncrypted" TEXT;

-- CreateTable
CREATE TABLE "AdminTwoFactorBackupCode" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminTwoFactorBackupCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTrustedDevice" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminTrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminTwoFactorBackupCode_codeHash_key" ON "AdminTwoFactorBackupCode"("codeHash");

-- CreateIndex
CREATE INDEX "AdminTwoFactorBackupCode_adminUserId_idx" ON "AdminTwoFactorBackupCode"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminTwoFactorBackupCode_usedAt_idx" ON "AdminTwoFactorBackupCode"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminTrustedDevice_tokenHash_key" ON "AdminTrustedDevice"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminTrustedDevice_adminUserId_idx" ON "AdminTrustedDevice"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminTrustedDevice_expiresAt_idx" ON "AdminTrustedDevice"("expiresAt");

-- AddForeignKey
ALTER TABLE "AdminTwoFactorBackupCode" ADD CONSTRAINT "AdminTwoFactorBackupCode_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTrustedDevice" ADD CONSTRAINT "AdminTrustedDevice_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
