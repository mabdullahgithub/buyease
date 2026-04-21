"use client";

import { TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Frame } from "@shopify/polaris";
import { Suspense } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { EmbeddedSoftNavigation } from "@/components/merchant/embedded-soft-navigation";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MerchantAppFrame({ children }: AppLayoutProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <EmbeddedSoftNavigation />
      <TitleBar title="BuyEase COD Form" />
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
