-- CreateTable
CREATE TABLE "BuyButtonConfig" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL DEFAULT 'Order via COD',
    "buttonSubtitle" TEXT,
    "iconId" TEXT NOT NULL DEFAULT 'cart',
    "iconAlign" TEXT NOT NULL DEFAULT 'start',
    "showIcon" BOOLEAN NOT NULL DEFAULT true,
    "animation" TEXT NOT NULL DEFAULT 'none',
    "stickyPosition" TEXT NOT NULL DEFAULT 'none',
    "mobileFullWidth" BOOLEAN NOT NULL DEFAULT false,
    "bgColor" TEXT NOT NULL DEFAULT '#000000',
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "borderColor" TEXT NOT NULL DEFAULT '#000000',
    "fontSizePx" INTEGER NOT NULL DEFAULT 16,
    "borderRadiusPx" INTEGER NOT NULL DEFAULT 8,
    "borderWidthPx" INTEGER NOT NULL DEFAULT 0,
    "shadowStrength" INTEGER NOT NULL DEFAULT 0,
    "isBold" BOOLEAN NOT NULL DEFAULT false,
    "isItalic" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyButtonConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormDesignConfig" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "formType" TEXT NOT NULL DEFAULT 'popup',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "formBgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "formTextColor" TEXT NOT NULL DEFAULT '#000000',
    "formBorderColor" TEXT NOT NULL DEFAULT '#E5E5E5',
    "formBorderRadiusPx" INTEGER NOT NULL DEFAULT 12,
    "formPaddingPx" INTEGER NOT NULL DEFAULT 24,
    "fieldBgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "fieldTextColor" TEXT NOT NULL DEFAULT '#000000',
    "fieldBorderColor" TEXT NOT NULL DEFAULT '#D1D5DB',
    "fieldBorderRadiusPx" INTEGER NOT NULL DEFAULT 6,
    "fieldFontSizePx" INTEGER NOT NULL DEFAULT 14,
    "textAlign" TEXT NOT NULL DEFAULT 'left',
    "hideLabels" BOOLEAN NOT NULL DEFAULT false,
    "rtl" BOOLEAN NOT NULL DEFAULT false,
    "autocomplete" BOOLEAN NOT NULL DEFAULT true,
    "errorRequired" TEXT NOT NULL DEFAULT 'This field is required',
    "errorInvalid" TEXT NOT NULL DEFAULT 'Please enter a valid value',
    "errorSoldOut" TEXT NOT NULL DEFAULT 'This product is sold out',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormDesignConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "countriesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "countries" JSONB NOT NULL DEFAULT '[]',
    "provincesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "provinces" JSONB NOT NULL DEFAULT '[]',
    "importedFromShopify" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyButtonConfig_shop_key" ON "BuyButtonConfig"("shop");

-- CreateIndex
CREATE INDEX "BuyButtonConfig_shop_idx" ON "BuyButtonConfig"("shop");

-- CreateIndex
CREATE INDEX "BuyButtonConfig_isVisible_idx" ON "BuyButtonConfig"("isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "FormDesignConfig_shop_key" ON "FormDesignConfig"("shop");

-- CreateIndex
CREATE INDEX "FormDesignConfig_shop_idx" ON "FormDesignConfig"("shop");

-- CreateIndex
CREATE INDEX "FormDesignConfig_isVisible_idx" ON "FormDesignConfig"("isVisible");

-- CreateIndex
CREATE INDEX "ShippingRate_shop_idx" ON "ShippingRate"("shop");

-- CreateIndex
CREATE INDEX "ShippingRate_isActive_idx" ON "ShippingRate"("isActive");

-- CreateIndex
CREATE INDEX "ShippingRate_shop_sortOrder_idx" ON "ShippingRate"("shop", "sortOrder");

-- AddForeignKey
ALTER TABLE "BuyButtonConfig" ADD CONSTRAINT "BuyButtonConfig_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormDesignConfig" ADD CONSTRAINT "FormDesignConfig_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
