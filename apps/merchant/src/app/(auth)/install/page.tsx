import { validateShopDomain } from "@/lib/auth";
import { InstallEmbedRecovery } from "@/components/merchant/install-embed-recovery";
import { InstallCard } from "./install-card";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParams = Promise<{
  shop?: string;
  host?: string;
  error?: string;
  return_to?: string;
}>;

export default async function InstallPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const shopInput = params.shop ?? "";
  const normalizedShop = shopInput ? validateShopDomain(shopInput) : null;
  const hasInvalidShop = Boolean(shopInput) && !normalizedShop;
  const returnTo = params.return_to?.startsWith("/") ? params.return_to : "/overview";

  if (normalizedShop && !params.error) {
    const next = new URLSearchParams({ shop: normalizedShop, return_to: returnTo });
    if (params.host) {
      next.set("host", params.host);
    }
    redirect(`/api/auth/install?${next.toString()}`);
  }

  return (
    <>
      <Suspense fallback={null}>
        <InstallEmbedRecovery />
      </Suspense>
      <InstallCard
        hasAuthError={Boolean(params.error)}
        hasInvalidShop={hasInvalidShop}
      />
    </>
  );
}
