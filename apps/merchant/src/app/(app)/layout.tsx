"use client";

import { AppProvider, Box, Frame, Navigation, TopBar } from "@shopify/polaris";
import {
  HomeIcon,
  OrderIcon,
  FormsIcon,
  GiftCardIcon,
  ChartVerticalIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import { usePathname } from "next/navigation";
import { useState } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { BrandLogo } from "@/components/merchant/brand-logo";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section
        title="buyease"
        items={[
          {
            url: "/form-builder",
            label: "Form Builder",
            icon: FormsIcon,
            selected: pathname.startsWith("/form-builder"),
          },
          {
            url: "/quantity-offers",
            label: "Quantity Offers",
            icon: OrderIcon,
            selected: pathname.startsWith("/quantity-offers"),
          },
          {
            url: "/upsells-downsells",
            label: "Upsells & Downsells",
            icon: GiftCardIcon,
            selected: pathname.startsWith("/upsells-downsells"),
          },
          {
            url: "/integrations-messaging",
            label: "Integrations & Messaging",
            icon: HomeIcon,
            selected: pathname.startsWith("/integrations-messaging"),
          },
          {
            url: "/analytics",
            label: "Analytics",
            icon: ChartVerticalIcon,
            selected: pathname.startsWith("/analytics"),
          },
          {
            url: "/settings",
            label: "Settings",
            icon: SettingsIcon,
            selected: pathname.startsWith("/settings"),
          },
          {
            url: "/plan",
            label: "Plan",
            icon: OrderIcon,
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
        <BrandLogo href="/form-builder" />
        <TopBar
          showNavigationToggle
          onNavigationToggle={() => setMobileNavigationActive((prev) => !prev)}
        />
      </div>
    </Box>
  );

  return (
    <AppProvider i18n={enTranslations}>
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
