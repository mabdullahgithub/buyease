"use client";

import type { ReactNode } from "react";
import { Frame } from "@shopify/polaris";

export default function DashboardLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <Frame>
      {children}
    </Frame>
  );
}
