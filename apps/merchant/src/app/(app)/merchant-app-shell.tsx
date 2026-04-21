"use client";

import { TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { EmbeddedSoftNavigation } from "@/components/merchant/embedded-soft-navigation";

export default function MerchantAppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppProvider i18n={enTranslations}>
      <EmbeddedSoftNavigation />
      <TitleBar title="BuyEase COD Form" />
      <Frame>{children}</Frame>
    </AppProvider>
  );
}
