"use client";

import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useSearchParams } from "next/navigation";
import { EmbeddedSoftNavigation } from "@/components/merchant/embedded-soft-navigation";
import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";

function buildEmbeddedHref(
  path: string,
  searchParams: ReadonlyURLSearchParams
): string {
  return appendEmbeddedAppQuery(path, {
    get: (key: string) => searchParams.get(key),
  });
}

export default function MerchantAppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const searchParams = useSearchParams();
  const overviewHref = buildEmbeddedHref("/overview", searchParams);
  const settingsHref = buildEmbeddedHref("/settings", searchParams);

  return (
    <AppProvider i18n={enTranslations}>
      <EmbeddedSoftNavigation />
      <NavMenu>
        <a href={overviewHref} rel="home">
          Overview
        </a>
        <a href={settingsHref}>Settings</a>
      </NavMenu>
      <TitleBar title="BuyEase COD Form" />
      <Frame>{children}</Frame>
    </AppProvider>
  );
}
