import { NextResponse } from "next/server";

export type SetCookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

/**
 * Serialize one Set-Cookie header value (name=value; Path=…; …).
 * Used instead of `response.cookies.set` when we must merge Shopify OAuth cookies
 * with our own: Next.js `ResponseCookies.set` replaces *all* Set-Cookie headers.
 */
export function serializeSetCookie(name: string, value: string, opts: SetCookieOptions): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (opts.path !== undefined) {
    parts.push(`Path=${opts.path}`);
  }
  if (opts.maxAge !== undefined) {
    parts.push(`Max-Age=${opts.maxAge}`);
  }
  if (opts.expires) {
    parts.push(`Expires=${opts.expires.toUTCString()}`);
  }
  if (opts.httpOnly) {
    parts.push("HttpOnly");
  }
  if (opts.secure) {
    parts.push("Secure");
  }
  if (opts.sameSite) {
    const s = opts.sameSite.toLowerCase();
    const cap = s === "none" ? "None" : s === "strict" ? "Strict" : "Lax";
    parts.push(`SameSite=${cap}`);
  }
  return parts.join("; ");
}

/** Read every Set-Cookie line from a Fetch Headers or Response. */
export function collectSetCookieLines(source: Headers | Response): string[] {
  const headers = source instanceof Response ? source.headers : source;
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

/**
 * 307 redirect with multiple independent Set-Cookie headers.
 * Do not mix with `nextResponse.cookies.set` — that API clears other Set-Cookie values.
 */
export function redirectWithSetCookies(url: string | URL, setCookieLines: string[]): NextResponse {
  const headers = new Headers();
  headers.set("Location", typeof url === "string" ? url : url.toString());
  for (const line of setCookieLines) {
    headers.append("Set-Cookie", line);
  }
  return new NextResponse(null, { status: 307, headers });
}
