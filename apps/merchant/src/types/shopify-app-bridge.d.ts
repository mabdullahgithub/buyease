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
