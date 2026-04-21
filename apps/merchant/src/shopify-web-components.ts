/* eslint-disable @typescript-eslint/no-namespace */
import type { AnchorHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from "react";

export {};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "s-app-nav": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        "s-link": DetailedHTMLProps<AnchorHTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
}
