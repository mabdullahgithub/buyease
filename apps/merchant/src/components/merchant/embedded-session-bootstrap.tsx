"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

declare global {
  interface Window {
    shopify?: {
      idToken?: () => Promise<string>;
    };
  }
}

/**
 * Fast path for embedded Shopify admin: after managed install, Shopify loads the app
 * with `shop` + `host`. We exchange the App Bridge ID token once, set session cookies,
 * and reload — no OAuth redirect chain (rules §5A / §5F).
 */
function EmbeddedSessionBootstrapInner(): null {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    const shop = searchParams.get("shop");
    const host = searchParams.get("host");
    if (!shop || !host) {
      return;
    }
    ran.current = true;

    const run = async (): Promise<void> => {
      try {
        const statusRes = await fetch("/api/auth/session-cookie", { credentials: "same-origin" });
        if (!statusRes.ok) {
          return;
        }
        const status = (await statusRes.json()) as { hasSession?: boolean };
        if (status.hasSession) {
          return;
        }

        const waitForAppBridge = async (): Promise<string> => {
          const deadline = Date.now() + 8000;
          while (Date.now() < deadline) {
            const idTokenFn = window.shopify?.idToken;
            if (typeof idTokenFn === "function") {
              return idTokenFn.call(window.shopify);
            }
            await new Promise((r) => setTimeout(r, 30));
          }
          throw new Error("App Bridge did not load in time");
        };

        const idToken = await waitForAppBridge();
        const res = await fetch("/api/auth/token-exchange", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ host }),
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch {
        ran.current = false;
      }
    };

    void run();
  }, [searchParams]);

  return null;
}

export function EmbeddedSessionBootstrap() {
  return (
    <Suspense fallback={null}>
      <EmbeddedSessionBootstrapInner />
    </Suspense>
  );
}
