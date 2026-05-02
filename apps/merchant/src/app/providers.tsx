"use client";

import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import Link from "next/link";

import { NavMenu } from "@shopify/app-bridge-react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

type NextLinkProps = {
  children?: ReactNode;
  url?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

function NextPolarisLink({ children, url, ...rest }: NextLinkProps): ReactElement {
  const href = url ?? "/";
  return <Link href={href} {...rest}>{children}</Link>;
}

export default function Providers({ children }: { children: ReactNode }): ReactElement {
  return (
    <AppProvider i18n={translations} linkComponent={NextPolarisLink}>
      <NavMenu>
        <a href="/" rel="home">Home</a>
        <a href="/form-builder">Form Builder</a>
        <a href="/upsells">Upsells</a>
        <a href="/analytics">Analytics</a>
        <a href="/fraud-protection">Fraud Protection</a>
        <a href="/settings">Settings</a>
        <a href="/billing">Billing Plans</a>
      </NavMenu>

      {children}
    </AppProvider>
  );
}
