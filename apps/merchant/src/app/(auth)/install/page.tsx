import { validateShopDomain } from "@/lib/auth";
import { InstallEmbedRecovery } from "@/components/merchant/install-embed-recovery";
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
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <Suspense fallback={null}>
        <InstallEmbedRecovery />
      </Suspense>
      <section style={{ width: "100%", maxWidth: "480px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 600 }}>
          Install BuyEase
        </h1>
        <p style={{ margin: "0 0 16px", color: "#6b7280" }}>
          BuyEase installation is initiated by Shopify only. Open the app from your
          Shopify Admin Apps page to continue securely.
        </p>

        {params.error ? (
          <p style={{ margin: "0 0 12px", color: "#b91c1c" }}>
            Shopify authentication did not complete. Re-open BuyEase in Shopify Admin
            and try again.
          </p>
        ) : null}

        {hasInvalidShop ? (
          <p style={{ margin: "0 0 12px", color: "#b91c1c" }}>
            The install request did not include a valid Shopify shop context.
          </p>
        ) : null}
        <p style={{ margin: 0, color: "#374151", fontSize: "14px" }}>
          Manual shop-domain entry has been disabled to meet Built for Shopify
          installation requirements.
        </p>
      </section>
    </main>
  );
}
