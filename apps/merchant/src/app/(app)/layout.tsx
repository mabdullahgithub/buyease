"use client";

import { TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Box, Frame, Navigation, TopBar } from "@shopify/polaris";
import {
  HomeFilledIcon,
  OrderIcon,
  FormsIcon,
  GiftCardIcon,
  ChartVerticalIcon,
  SettingsIcon,
  ConnectIcon,
  PlanIcon,
} from "@shopify/polaris-icons";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { BrandLogo } from "@/components/merchant/brand-logo";
import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MerchantAppFrame({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const withEmbed = (path: string): string => appendEmbeddedAppQuery(path, searchParams);
  const navigationLocation = appendEmbeddedAppQuery(pathname, searchParams);

  const navigationMarkup = (
    <Navigation location={navigationLocation}>
      <Navigation.Section
        title="buyease"
        items={[
          {
            url: withEmbed("/form-builder"),
            label: "Overview",
            icon: HomeFilledIcon,
            selected: pathname === "/form-builder" || pathname === "/form-builder/",
          },
          {
            url: withEmbed("/form-builder/editor"),
            label: "Form Builder",
            icon: FormsIcon,
            selected: pathname.startsWith("/form-builder/editor"),
          },
          {
            url: withEmbed("/quantity-offers"),
            label: "Quantity Offers",
            icon: OrderIcon,
            selected: pathname.startsWith("/quantity-offers"),
          },
          {
            url: withEmbed("/upsells-downsells"),
            label: "Upsells & Downsells",
            icon: GiftCardIcon,
            selected: pathname.startsWith("/upsells-downsells"),
          },
          {
            url: withEmbed("/integrations-messaging"),
            label: "Integrations & Messaging",
            icon: ConnectIcon,
            selected: pathname.startsWith("/integrations-messaging"),
          },
          {
            url: withEmbed("/analytics"),
            label: "Analytics",
            icon: ChartVerticalIcon,
            selected: pathname.startsWith("/analytics"),
          },
          {
            url: withEmbed("/settings"),
            label: "Settings",
            icon: SettingsIcon,
            selected: pathname.startsWith("/settings"),
          },
          {
            url: withEmbed("/plan"),
            label: "Plan",
            icon: PlanIcon,
            selected: pathname.startsWith("/plan"),
          },
        ]}
      />
    </Navigation>
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
        <TopBar
          showNavigationToggle
          onNavigationToggle={() => setMobileNavigationActive((prev) => !prev)}
        />
      </div>
    </Box>
  );

  return (
    <AppProvider i18n={enTranslations}>
      <TitleBar title="BuyEase" />
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavigationActive}
        onNavigationDismiss={() => setMobileNavigationActive(false)}
      >
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
