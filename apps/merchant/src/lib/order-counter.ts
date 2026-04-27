import { Redis } from "ioredis";

import { PLANS, type PlanKey } from "@/lib/billing";

const redis = new Redis(process.env.REDIS_URL!);

const PLAN_LIMITS: Record<string, number> = Object.fromEntries(
  (Object.keys(PLANS) as PlanKey[]).map((key) => [
    key,
    Number.isFinite(PLANS[key].orderLimit) ? PLANS[key].orderLimit : Number.POSITIVE_INFINITY,
  ]),
);

export async function checkAndIncrementOrderCount(
  shopDomain: string,
  plan: string,
  billingCycleStart: Date,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limit = PLAN_LIMITS[plan] ?? 60;
  if (limit === Number.POSITIVE_INFINITY) {
    return { allowed: true, current: 0, limit };
  }

  const cycleKey = billingCycleStart.toISOString().split("T")[0];
  const counterKey = `orders:${shopDomain}:${cycleKey}`;
  const current = parseInt((await redis.get(counterKey)) ?? "0", 10);

  if (current >= limit) {
    return { allowed: false, current, limit };
  }

  const newCount = await redis.incr(counterKey);
  await redis.expire(counterKey, 35 * 24 * 60 * 60);

  return { allowed: true, current: newCount, limit };
}

export async function getOrderCount(shopDomain: string, billingCycleStart: Date): Promise<number> {
  const cycleKey = billingCycleStart.toISOString().split("T")[0];
  const counterKey = `orders:${shopDomain}:${cycleKey}`;
  return parseInt((await redis.get(counterKey)) ?? "0", 10);
}
