import type { NextRequest } from "next/server";

/**
 * Web adapter uses `new URL(request.url)`. In the App Router, `Request.url` can be
 * path-only in some runtimes; `nextUrl` is always an absolute URL for the incoming request.
 */
export function toShopifyAuthRequest(req: NextRequest): Request {
  const absolute = req.nextUrl.toString();
  if (req.url.startsWith("http://") || req.url.startsWith("https://")) {
    return req;
  }
  return new Request(absolute, {
    method: req.method,
    headers: req.headers,
  });
}
