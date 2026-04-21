"use client";

import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Box, Frame } from "@shopify/polaris";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { BrandLogo } from "@/components/merchant/brand-logo";
import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MerchantAppFrame({ children }: AppLayoutProps) {
  const searchParams = useSearchParams();

  const withEmbed = (path: string): string => appendEmbeddedAppQuery(path, searchParams);

  /** Renders in Shopify admin app nav (left rail under Apps), not inside the iframe content. */
  const adminNavMenu = (
    <NavMenu>
      <a href={withEmbed("/form-builder")} rel="home">
        Home
      </a>
      <a href={withEmbed("/form-builder")}>Form Builder</a>
      <a href={withEmbed("/quantity-offers")}>Quantity Offers</a>
      <a href={withEmbed("/upsells-downsells")}>Upsells & Downsells</a>
      <a href={withEmbed("/integrations-messaging")}>Integrations & Messaging</a>
      <a href={withEmbed("/analytics")}>Analytics</a>
      <a href={withEmbed("/settings")}>Settings</a>
      <a href={withEmbed("/plan")}>Plan</a>
    </NavMenu>
  );

  const topBarMarkup = (
    <Box paddingInlineStart="300" paddingInlineEnd="200">
      <div
        style={{
          minHeight: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <BrandLogo href={withEmbed("/form-builder")} />
      </div>
    </Box>
  );

  return (
    <AppProvider i18n={enTranslations}>
      {adminNavMenu}
      <TitleBar title="BuyEase COD" />
      <Frame topBar={topBarMarkup}>
        {children}
      </Frame>
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
