import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  keyFn: (req: NextRequest) => string | null;
};

const caches = new Map<string, LRUCache<string, RateLimitEntry>>();

function getOrCreateCache(name: string, maxEntries: number): LRUCache<string, RateLimitEntry> {
  const existing = caches.get(name);
  if (existing) return existing;

  const cache = new LRUCache<string, RateLimitEntry>({
    max: maxEntries,
    ttl: 1000 * 60 * 60,
  });
  caches.set(name, cache);
  return cache;
}

function checkLimit(
  cache: LRUCache<string, RateLimitEntry>,
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    cache.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  cache.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

function rateLimitHeaders(limit: number, remaining: number, resetAt: number): HeadersInit {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

export function createRateLimiter(name: string, config: RateLimitConfig) {
  const cache = getOrCreateCache(name, 10_000);

  return function rateLimit(req: NextRequest): NextResponse | null {
    const key = config.keyFn(req);
    if (!key) return null;

    const { allowed, remaining, resetAt } = checkLimit(
      cache,
      key,
      config.limit,
      config.windowMs,
    );

    if (!allowed) {
      const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders(config.limit, 0, resetAt),
            "Retry-After": String(retryAfterSeconds),
          },
        },
      );
    }

    req.headers.set("x-ratelimit-limit", String(config.limit));
    req.headers.set("x-ratelimit-remaining", String(remaining));
    req.headers.set("x-ratelimit-reset", String(Math.ceil(resetAt / 1000)));

    return null;
  };
}

export function addRateLimitHeaders(
  response: NextResponse,
  req: NextRequest,
): NextResponse {
  const limit = req.headers.get("x-ratelimit-limit");
  const remaining = req.headers.get("x-ratelimit-remaining");
  const reset = req.headers.get("x-ratelimit-reset");

  if (limit) response.headers.set("X-RateLimit-Limit", limit);
  if (remaining) response.headers.set("X-RateLimit-Remaining", remaining);
  if (reset) response.headers.set("X-RateLimit-Reset", reset);

  return response;
}

export function extractShopFromSession(req: NextRequest): string | null {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.split(".")[1]!)) as { dest?: string };
    if (!payload.dest) return null;
    const url = new URL(payload.dest);
    return url.hostname;
  } catch {
    return null;
  }
}

export function extractIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export const otpSendLimiter = createRateLimiter("otp-send", {
  limit: 5,
  windowMs: 1000 * 60 * 60,
  keyFn: (req) => extractIp(req) ?? "unknown",
});

export const otpVerifyLimiter = createRateLimiter("otp-verify", {
  limit: 10,
  windowMs: 1000 * 60 * 15,
  keyFn: (req) => extractIp(req) ?? "unknown",
});

export const ordersLimiter = createRateLimiter("orders", {
  limit: 60,
  windowMs: 1000 * 60,
  keyFn: (req) => extractShopFromSession(req),
});

export const storefrontLimiter = createRateLimiter("storefront", {
  limit: 120,
  windowMs: 1000 * 60,
  keyFn: (req) => extractIp(req),
});

export const formConfigLimiter = createRateLimiter("form-config", {
  limit: 30,
  windowMs: 1000 * 60,
  keyFn: (req) => extractShopFromSession(req),
});
