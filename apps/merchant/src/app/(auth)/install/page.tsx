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
          Connect your Shopify store to start using buyease.
        </p>

        {params.error ? (
          <p style={{ margin: "0 0 12px", color: "#b91c1c" }}>
            Shopify authentication did not complete. Please try again.
          </p>
        ) : null}

        {hasInvalidShop ? (
          <p style={{ margin: "0 0 12px", color: "#b91c1c" }}>
            Please enter a valid `.myshopify.com` domain.
          </p>
        ) : null}

        <form action="/api/auth/install" method="get">
          <input type="hidden" name="return_to" value={returnTo} />
          {params.host ? <input type="hidden" name="host" value={params.host} /> : null}
          <label htmlFor="shop-domain" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Shop domain
          </label>
          <input
            id="shop-domain"
            name="shop"
            type="text"
            required
            autoComplete="off"
            placeholder="your-store.myshopify.com"
            defaultValue={normalizedShop ?? shopInput}
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              padding: "0 12px",
              marginBottom: "12px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#111827",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continue to Shopify
          </button>
        </form>
      </section>
    </main>
  );
}
