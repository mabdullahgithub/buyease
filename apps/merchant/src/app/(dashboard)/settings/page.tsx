import { Suspense } from "react";
import type { ReactElement } from "react";

import {
  SettingsPageContent,
  SettingsPageSkeleton,
} from "@/components/SettingsPageContent";

export default function SettingsPage(): ReactElement {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}
