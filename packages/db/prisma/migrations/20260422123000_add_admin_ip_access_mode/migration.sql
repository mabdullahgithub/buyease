-- CreateEnum
CREATE TYPE "AdminIpAccessMode" AS ENUM ('ALLOW_ALL', 'RESTRICTED_ALLOWLIST');

-- CreateTable
CREATE TABLE "AdminIpAccessSetting" (
    "id" INTEGER NOT NULL,
    "allowlistMode" "AdminIpAccessMode" NOT NULL DEFAULT 'RESTRICTED_ALLOWLIST',
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIpAccessSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminIpAccessSetting_allowlistMode_idx" ON "AdminIpAccessSetting"("allowlistMode");

-- AddForeignKey
ALTER TABLE "AdminIpAccessSetting" ADD CONSTRAINT "AdminIpAccessSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
