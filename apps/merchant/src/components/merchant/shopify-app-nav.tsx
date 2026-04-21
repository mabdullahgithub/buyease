"use client";

import "@/shopify-web-components";
import { useSearchParams } from "next/navigation";
import { appendEmbeddedAppQuery } from "@/lib/embedded-app-url";

/**
 * Registers navigation in the **Shopify admin** app nav (under Apps), not as
 * in-iframe UI. Requires `polaris.js` + `app-bridge.js` (see root `layout.tsx`).
 *
 * @see https://shopify.dev/docs/api/app-home/app-bridge-web-components/app-nav
 */
export function ShopifyAppNav() {
  const searchParams = useSearchParams();
  const href = (path: string): string => appendEmbeddedAppQuery(path, searchParams);

  return (
    <s-app-nav>
      <s-link href={href("/form-builder")} rel="home">
        Home
      </s-link>
      <s-link href={href("/form-builder")}>Form Builder</s-link>
      <s-link href={href("/quantity-offers")}>Quantity Offers</s-link>
      <s-link href={href("/upsells-downsells")}>Upsells & Downsells</s-link>
      <s-link href={href("/integrations-messaging")}>Integrations & Messaging</s-link>
      <s-link href={href("/analytics")}>Analytics</s-link>
      <s-link href={href("/settings")}>Settings</s-link>
      <s-link href={href("/plan")}>Plan</s-link>
    </s-app-nav>
  );
}
