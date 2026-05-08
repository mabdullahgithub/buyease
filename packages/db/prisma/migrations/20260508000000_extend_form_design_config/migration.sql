-- AlterTable: add missing design-system fields to FormDesignConfig
ALTER TABLE "FormDesignConfig"
  ADD COLUMN IF NOT EXISTS "formBorderWidthPx" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "formShadowPx"      INTEGER NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS "formTextBold"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "formTextItalic"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "showIcons"         BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "stickyMobile"      BOOLEAN NOT NULL DEFAULT true;
