-- Add persistent admin profile fields.
ALTER TABLE "AdminUser"
ADD COLUMN "displayName" TEXT,
ADD COLUMN "profileImage" BYTEA,
ADD COLUMN "profileImageMimeType" TEXT;
