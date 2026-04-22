"use client";

import { useEffect } from "react";

type VitalName = "LCP" | "CLS" | "INP";
type VitalRating = "good" | "needs-improvement" | "poor";

type VitalPayload = {
  name: VitalName;
  value: number;
  rating: VitalRating;
  id: string;
  path: string;
  navigationType?: string;
};

declare global {
  interface Window {
    shopify?: {
      idToken?: () => Promise<string>;
    };
  }
}

const REPORT_ENDPOINT = "/api/monitoring/web-vitals";

async function waitForIdToken(): Promise<string | null> {
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    const idTokenFn = window.shopify?.idToken;
    if (typeof idTokenFn === "function") {
      try {
        return await idTokenFn.call(window.shopify);
      } catch {
        return null;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  return null;
}

async function sendVital(payload: VitalPayload): Promise<void> {
  const idToken = await waitForIdToken();
  if (!idToken) {
    return;
  }

  await fetch(REPORT_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function WebVitalsReporter(): null {
  useEffect(() => {
    let isMounted = true;

    const run = async (): Promise<void> => {
      const { onCLS, onINP, onLCP } = await import("web-vitals");
      if (!isMounted) {
        return;
      }

      const path = `${window.location.pathname}${window.location.search}`;
      const navigationType = performance.getEntriesByType("navigation")[0];
      const navigationTypeValue =
        navigationType && "type" in navigationType
          ? String(navigationType.type)
          : undefined;

      const report = (metric: {
        name: string;
        value: number;
        rating: string;
        id: string;
      }): void => {
        if (metric.name !== "LCP" && metric.name !== "CLS" && metric.name !== "INP") {
          return;
        }
        if (
          metric.rating !== "good" &&
          metric.rating !== "needs-improvement" &&
          metric.rating !== "poor"
        ) {
          return;
        }

        void sendVital({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          path,
          navigationType: navigationTypeValue,
        });
      };

      onLCP(report);
      onCLS(report);
      onINP(report);
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
