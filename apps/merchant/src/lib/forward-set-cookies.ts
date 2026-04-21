import type { NextResponse } from "next/server";

type ShopifyHeaderSource = Headers | Record<string, string | string[] | undefined>;

/**
 * Copies Set-Cookie headers from a Shopify `auth.begin` / `auth.callback` result
 * onto a Next.js response. Required for the web-api adapter: `auth.begin` returns a
 * standalone `Response` whose cookies must be forwarded or the OAuth state cookie
 * is never stored in the browser.
 */
export function forwardSetCookiesToNextResponse(
  from: ShopifyHeaderSource,
  to: NextResponse
): void {
  if (from instanceof Headers) {
    const list = typeof from.getSetCookie === "function" ? from.getSetCookie() : [];
    if (list.length > 0) {
      for (const cookie of list) {
        to.headers.append("Set-Cookie", cookie);
      }
      return;
    }
    const single = from.get("set-cookie") ?? from.get("Set-Cookie");
    if (single) {
      to.headers.append("Set-Cookie", single);
    }
    return;
  }

  const raw = from["set-cookie"] ?? from["Set-Cookie"];
  if (!raw) {
    return;
  }
  const list = Array.isArray(raw) ? raw : [raw];
  for (const cookie of list) {
    if (cookie) {
      to.headers.append("Set-Cookie", cookie);
    }
  }
}
