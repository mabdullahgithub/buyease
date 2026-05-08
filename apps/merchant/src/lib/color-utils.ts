import type { HSBAColor } from "@shopify/polaris";
import { hsbToRgb, rgbToHsb, rgbaString } from "@shopify/polaris";

export function hsbaToRgbaString(color: HSBAColor): string {
  return rgbaString(hsbToRgb(color));
}

export function hexToHsb(hex: string): HSBAColor {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { ...rgbToHsb({ red: r, green: g, blue: b }), alpha: 1 };
}

export function hsbToHex(color: HSBAColor): string {
  const { red, green, blue } = hsbToRgb(color);
  const h = (n: number): string => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(red)}${h(green)}${h(blue)}`;
}
