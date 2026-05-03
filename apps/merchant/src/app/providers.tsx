"use client";

import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import Link from "next/link";

import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

type NextLinkProps = {
  children?: ReactNode;
  url?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

function NextPolarisLink({ children, url, ...rest }: NextLinkProps): ReactElement {
  const href = url ?? "/";
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

/**
 * Shopify admin reads navigation from App Bridge `<s-app-nav>` + `<s-link>` (CDN web components).
 * The older React `NavMenu` / `<ui-nav-menu>` pattern often fails to show links with App Bridge 4 + `app-bridge.js`.
 * `rel="home"` marks the default route; that entry is hidden from the visible menu per Shopify behavior.
 */
export default function Providers({ children }: { children: ReactNode }): ReactElement {
  return (
    <AppProvider i18n={translations} linkComponent={NextPolarisLink}>
      <s-app-nav>
        <s-link href="/" rel="home">
          Home
        </s-link>
        <s-link href="/form-builder">Form Builder</s-link>
        <s-link href="/upsells">Upsells</s-link>
        <s-link href="/analytics">Analytics</s-link>
        <s-link href="/settings">Settings</s-link>
        <s-link href="/billing">Billing</s-link>
      </s-app-nav>

      {children}
    </AppProvider>
  );
}
