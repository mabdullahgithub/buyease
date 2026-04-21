"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SHOPIFY_EMBED_STORAGE_KEY } from "@/lib/shopify-embed-session-storage";

/**
 * Saves `?shop=&host=` (and related params) whenever the app loads with them, so a later
 * redirect to `/install` without those params (proxy / client navigation) can recover.
 */
function PersistShopifyEmbedParamsInner(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shop = searchParams.get("shop");
    const host = searchParams.get("host");
    if (shop && host) {
      const qs = searchParams.toString();
      if (qs) {
        sessionStorage.setItem(SHOPIFY_EMBED_STORAGE_KEY, `?${qs}`);
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function PersistShopifyEmbedParams() {
  return (
    <Suspense fallback={null}>
      <PersistShopifyEmbedParamsInner />
    </Suspense>
  );
}
