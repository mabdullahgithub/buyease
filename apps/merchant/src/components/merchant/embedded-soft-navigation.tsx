"use client";

import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const APP_PREFETCH_ROUTES = [
  "/overview",
  "/form-builder",
  "/form-builder/editor",
  "/quantity-offers",
  "/upsells-downsells",
  "/integrations-messaging",
  "/analytics",
  "/settings",
  "/plan",
] as const;

function isModifiedClick(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

/**
 * App Bridge `ui-nav-menu` and plain `<a href="/…">` links perform full document
 * loads in the iframe. Intercept same-origin navigations and use the Next.js App
 * Router client transition instead (plus prefetch of main routes).
 */
export function EmbeddedSoftNavigation(): null {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const onClickCapture = (e: MouseEvent): void => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.download) return;
      if (isModifiedClick(e)) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/api/")) return;

      const hybrid: Pick<URLSearchParams, "get"> = {
        get: (k: string) => url.searchParams.get(k) ?? searchParams.get(k),
      };
      const pathWithSearch = `${url.pathname}${url.search}`;
      const destination = appendEmbeddedAppQuery(pathWithSearch, hybrid);

      const here = `${window.location.pathname}${window.location.search}`;
      if (destination === here) {
        return;
      }

      e.preventDefault();
      router.push(destination, { scroll: false });
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [router, searchParams]);

  useEffect(() => {
    const hybrid: Pick<URLSearchParams, "get"> = {
      get: (k: string) => searchParams.get(k),
    };
    for (const path of APP_PREFETCH_ROUTES) {
      void router.prefetch(appendEmbeddedAppQuery(path, hybrid));
    }
  }, [router, searchParams]);

  return null;
}
