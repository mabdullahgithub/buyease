"use client";

import { usePathname } from "next/navigation";
import { useMemo, type ReactElement } from "react";

import { BillingPlansPageSkeleton } from "@/components/skeletons/BillingPlansPageSkeleton";
import { ComingSoonPageSkeleton } from "@/components/skeletons/ComingSoonPageSkeleton";
import { FormBuilderPageSkeleton } from "@/components/skeletons/FormBuilderPageSkeleton";
import { StandardDashboardPageSkeleton } from "@/components/skeletons/StandardDashboardPageSkeleton";
import {
  getDashboardSkeletonVariant,
  type DashboardSkeletonVariant,
} from "@/lib/dashboard-skeleton-variant";

function renderSkeleton(variant: DashboardSkeletonVariant): ReactElement {
  switch (variant) {
    case "billing-plans":
      return <BillingPlansPageSkeleton />;
    case "form-builder":
      return <FormBuilderPageSkeleton />;
    case "coming-soon":
      return <ComingSoonPageSkeleton />;
    default:
      return <StandardDashboardPageSkeleton />;
  }
}

/**
 * Route-aware loading shell for all merchant dashboard pages.
 * Uses `usePathname()` so the skeleton matches the navigation target during transitions.
 */
export default function DashboardRouteSkeleton(): ReactElement {
  const pathname = usePathname();
  const variant = useMemo(() => getDashboardSkeletonVariant(pathname), [pathname]);

  return renderSkeleton(variant);
}
