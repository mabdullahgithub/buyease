-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "backupKey" TEXT,
ADD COLUMN     "passwordReminderDays" INTEGER NOT NULL DEFAULT 30;
