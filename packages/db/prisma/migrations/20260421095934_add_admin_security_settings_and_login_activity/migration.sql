-- CreateTable
CREATE TABLE "AdminIpAllowlist" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIpAllowlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLoginActivity" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "email" TEXT,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "locationCountry" TEXT,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminIpAllowlist_ip_key" ON "AdminIpAllowlist"("ip");

-- CreateIndex
CREATE INDEX "AdminIpAllowlist_isActive_idx" ON "AdminIpAllowlist"("isActive");

-- CreateIndex
CREATE INDEX "AdminLoginActivity_adminUserId_idx" ON "AdminLoginActivity"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminLoginActivity_createdAt_idx" ON "AdminLoginActivity"("createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginActivity_ip_idx" ON "AdminLoginActivity"("ip");

-- AddForeignKey
ALTER TABLE "AdminIpAllowlist" ADD CONSTRAINT "AdminIpAllowlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLoginActivity" ADD CONSTRAINT "AdminLoginActivity_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
