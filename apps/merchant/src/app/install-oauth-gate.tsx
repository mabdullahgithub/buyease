"use client";

import { useLayoutEffect } from "react";

/**
 * Fallback when the server render did not see `shop` / `id_token` query params
 * (embedded iframe + rewrites). Uses Shopify-verified session tokens on the server
 * (POST) or a cheap GET when `shop` is already known.
 */
export function InstallOAuthGate(): null {
  useLayoutEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const shop = sp.get("shop");
    const idToken = sp.get("id_token");
    const host = sp.get("host");
    if (!shop && !idToken) {
      return;
    }

    let cancelled = false;

    const promise = shop
      ? fetch(`/api/session/exists?shop=${encodeURIComponent(shop)}`, { cache: "no-store" }).then(
          async (res) => {
            const j = (await res.json()) as { exists: boolean; shop?: string | null };
            return { exists: j.exists, shop: j.shop ?? shop };
          },
        )
      : fetch("/api/session/exists", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id_token: idToken }),
          cache: "no-store",
        }).then(async (res) => {
          const j = (await res.json()) as { exists: boolean; shop?: string | null };
          return { exists: j.exists, shop: j.shop ?? undefined };
        });

    void promise
      .then(({ exists, shop: resolvedShop }) => {
        if (cancelled || exists || !resolvedShop) return;
        const next = new URLSearchParams({ shop: resolvedShop });
        if (host) next.set("host", host);
        (window.top ?? window).location.href = `${window.location.origin}/api/auth?${next.toString()}`;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
