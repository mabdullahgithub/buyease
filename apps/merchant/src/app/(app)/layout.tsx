"use client";

import { AppProvider, Frame, Navigation, TopBar } from "@shopify/polaris";
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

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            url: "/dashboard",
            label: "Dashboard",
            icon: HomeIcon,
            selected: pathname === "/dashboard",
          },
          {
            url: "/orders",
            label: "Orders",
            icon: OrderIcon,
            selected: pathname.startsWith("/orders"),
          },
          {
            url: "/cod-form",
            label: "COD Form",
            icon: FormsIcon,
            selected: pathname.startsWith("/cod-form"),
          },
          {
            url: "/upsells",
            label: "Upsells",
            icon: GiftCardIcon,
            selected: pathname.startsWith("/upsells"),
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
        ]}
      />
    </Navigation>
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={() =>
        setMobileNavigationActive((prev) => !prev)
      }
    />
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
