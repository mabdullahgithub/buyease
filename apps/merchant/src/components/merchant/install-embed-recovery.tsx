"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SHOPIFY_EMBED_STORAGE_KEY } from "@/lib/shopify-embed-session-storage";

/**
 * `/install` is often hit with only `return_to` after the proxy dropped `shop`/`host`.
 * Restore from sessionStorage (saved on any prior embed load on this origin).
 */
function InstallEmbedRecoveryInner(): null {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("shop") && searchParams.get("host")) {
      return;
    }

    const stored = sessionStorage.getItem(SHOPIFY_EMBED_STORAGE_KEY);
    if (!stored || !stored.startsWith("?")) {
      return;
    }

    const merged = new URLSearchParams(stored.slice(1));
    const returnTo = searchParams.get("return_to");
    if (returnTo && returnTo.startsWith("/")) {
      merged.set("return_to", returnTo);
    }
    if (searchParams.get("error")) {
      merged.set("error", searchParams.get("error")!);
    }

    const next = `/install?${merged.toString()}`;
    router.replace(next);
  }, [router, searchParams]);

  return null;
}

export function InstallEmbedRecovery() {
  return (
    <Suspense fallback={null}>
      <InstallEmbedRecoveryInner />
    </Suspense>
  );
}
