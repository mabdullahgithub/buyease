"use client";

import { TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Frame } from "@shopify/polaris";
import { Suspense } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { ShopifyAppNav } from "@/components/merchant/shopify-app-nav";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MerchantAppFrame({ children }: AppLayoutProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <ShopifyAppNav />
      <TitleBar title="BuyEase COD" />
      <Frame>{children}</Frame>
    </AppProvider>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={null}>
      <MerchantAppFrame>{children}</MerchantAppFrame>
    </Suspense>
  );
}
