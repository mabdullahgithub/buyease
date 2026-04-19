type Bucket = {
  count: number;
  windowStartMs: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed window rate limiter (per server instance).
 * Suitable for low-traffic admin endpoints; replace with Redis in multi-instance production.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: now });
    return { ok: true };
  }

  if (existing.count >= max) {
    const retryAfterMs = windowMs - (now - existing.windowStartMs);
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  existing.count += 1;
  return { ok: true };
}
