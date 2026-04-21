"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { shopifyAdminEmbeddedAppUrl } from "@/lib/shopify-embedded-admin-url";
import { normalizeShopifyAppsPathname } from "@/lib/shopify-apps-path-prefix";

/**
 * If the merchant opens the app URL in a normal browser tab (same origin, top window)
 * while Shopify has already provided `shop` + `host`, bounce them into Admin — same
 * experience as EasySell (embedded under admin.shopify.com).
 */
function EmbeddedTopLevelRedirectInner(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.self !== window.top) {
      return;
    }

    const host = searchParams.get("host");
    const shop = searchParams.get("shop");
    if (!host || !shop) {
      return;
    }

    const apiKey = document.querySelector('meta[name="shopify-api-key"]')?.getAttribute("content") ?? "";
    if (!apiKey) {
      return;
    }

    const adminUrl = shopifyAdminEmbeddedAppUrl({
      hostParam: host,
      clientId: apiKey,
      pathname: normalizeShopifyAppsPathname(window.location.pathname),
      search: window.location.search,
    });
    if (!adminUrl) {
      return;
    }

    try {
      const current = new URL(window.location.href);
      const target = new URL(adminUrl);
      if (current.href !== target.href) {
        window.location.replace(adminUrl);
      }
    } catch {
      window.location.replace(adminUrl);
    }
  }, [searchParams]);

  return null;
}

export function EmbeddedTopLevelRedirect() {
  return (
    <Suspense fallback={null}>
      <EmbeddedTopLevelRedirectInner />
    </Suspense>
  );
}
