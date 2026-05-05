/**
 * Type declarations for Shopify App Bridge 4.x web components.
 * These custom elements are registered by the App Bridge CDN script
 * and used in the root layout to create native Shopify admin navigation.
 *
 * @see https://shopify.dev/docs/api/app-bridge-library/web-components/ui-nav-menu
 */

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-nav-menu": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface Window {
  shopify?: {
    idToken(): Promise<string>;
    toast: { show(message: string, options?: Record<string, unknown>): void };
    saveBar: {
      show(): Promise<void>;
      hide(): Promise<void>;
      toggle(): Promise<void>;
    };
    resourcePicker(options: Record<string, unknown>): Promise<unknown>;
    environment: { embedded: boolean; mobile: boolean };
    config: { apiKey: string; shop: string; locale: string };
  };
}
