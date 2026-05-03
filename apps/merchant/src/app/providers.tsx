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
        <Link href="/" rel="home">
          Home
        </Link>
        <Link href="/form-builder">Form Builder</Link>
        <Link href="/upsells">Upsells</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/settings">Settings</Link>
        <Link href="/billing">Billing Plans</Link>
      </NavMenu>

      {children}
    </AppProvider>
  );
}
