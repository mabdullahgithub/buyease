"use client";

import { useMemo } from "react";

type ShopifyBridge = {
  idToken(): Promise<string>;
  toast: { show(message: string): void };
};

export function useShopifyBridge(): ShopifyBridge {
  return useMemo(() => {
    if (typeof window !== "undefined" && window.shopify) {
      return {
        idToken: () => window.shopify!.idToken(),
        toast: window.shopify!.toast,
      };
    }
    return {
      async idToken(): Promise<string> { return ""; },
      toast: { show() {} },
    };
  }, []);
}
