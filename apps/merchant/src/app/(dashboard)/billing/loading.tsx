import type { ReactElement } from "react";

import { BillingPlansPageSkeleton } from "@/components/skeletons/BillingPlansPageSkeleton";

export default function BillingLoading(): ReactElement {
  return <BillingPlansPageSkeleton />;
}
