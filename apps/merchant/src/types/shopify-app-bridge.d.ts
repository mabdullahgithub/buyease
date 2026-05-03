/**
 * JSX for Shopify App Bridge 4.x web components (registered by CDN `app-bridge.js`).
 *
 * @see https://shopify.dev/docs/api/app-bridge-library/react-components/navmenu
 */

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "s-link": React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
