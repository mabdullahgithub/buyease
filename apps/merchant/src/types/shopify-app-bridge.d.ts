/**
 * Type declarations for Shopify App Bridge 4.x web components.
 * Registered by `app-bridge.js` (see root layout). Use `<s-app-nav>` / `<s-link>`
 * for admin sidebar navigation — legacy `<ui-nav-menu>` / React `NavMenu` alone
 * may not register items with the current CDN.
 *
 * @see https://shopify.dev/docs/api/app-bridge-library/reference/navigation-menu
 */

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-nav-menu": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "s-app-nav": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "s-link": React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    }
  }
}
