-- CreateTable
CREATE TABLE "AdminIpBlocklist" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIpBlocklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminIpBlocklist_ip_key" ON "AdminIpBlocklist"("ip");

-- CreateIndex
CREATE INDEX "AdminIpBlocklist_isActive_idx" ON "AdminIpBlocklist"("isActive");

-- AddForeignKey
ALTER TABLE "AdminIpBlocklist" ADD CONSTRAINT "AdminIpBlocklist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
