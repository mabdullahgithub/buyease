"use client";

import dynamic from "next/dynamic";
import { MerchantPageSkeleton } from "@/components/merchant/app-skeleton";
import type { HomeClientProps } from "./home-client";

const HomeClientDynamic = dynamic(
  () => import("./home-client").then((m) => m.HomeClient),
  { ssr: false, loading: () => <MerchantPageSkeleton /> }
);

export function OverviewClientBridge(props: HomeClientProps) {
  return <HomeClientDynamic {...props} />;
}
