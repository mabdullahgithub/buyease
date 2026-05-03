"use client";

import type { ReactNode } from "react";

import { BlockStack } from "@shopify/polaris";

import { AppPageFooter } from "@/components/AppPageFooter";

type DashboardLayoutProps = {
  children: ReactNode;
};

/**
 * Wraps all in-app routes with a consistent footer (aligned with Billing / pricing).
 */
export default function DashboardLayout({ children }: DashboardLayoutProps): ReactNode {
  return (
    <BlockStack gap="0">
      {children}
      <AppPageFooter />
    </BlockStack>
  );
}
