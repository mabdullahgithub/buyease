"use client";

import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Frame } from "@shopify/polaris";
import { Suspense } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MerchantAppFrame({ children }: AppLayoutProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <NavMenu>
        <a href="/form-builder" rel="home">Home</a>
        <a href="/form-builder">Form Builder</a>
        <a href="/quantity-offers">Quantity Offers</a>
        <a href="/upsells-downsells">Upsells & Downsells</a>
        <a href="/integrations-messaging">Integrations & Messaging</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
        <a href="/plan">Plan</a>
      </NavMenu>
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
