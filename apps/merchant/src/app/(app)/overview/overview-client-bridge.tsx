"use client";

import dynamic from "next/dynamic";
import type { HomeClientProps } from "./home-client";

const HomeClientDynamic = dynamic(
  () => import("./home-client").then((m) => m.HomeClient),
  { ssr: false, loading: () => null }
);

export function OverviewClientBridge(props: HomeClientProps) {
  return <HomeClientDynamic {...props} />;
}
