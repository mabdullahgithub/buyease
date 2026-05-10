import { LRUCache } from "lru-cache";

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 2000;

const formConfigCache = new LRUCache<string, Record<string, unknown>>({
  max: MAX_ENTRIES,
  ttl: TTL_MS,
});

const buttonConfigCache = new LRUCache<string, Record<string, unknown>>({
  max: MAX_ENTRIES,
  ttl: TTL_MS,
});

export function getCachedFormConfig(shop: string): Record<string, unknown> | undefined {
  return formConfigCache.get(shop);
}

export function setCachedFormConfig(shop: string, config: Record<string, unknown>): void {
  formConfigCache.set(shop, config);
}

export function invalidateFormConfig(shop: string): void {
  formConfigCache.delete(shop);
}

export function getCachedButtonConfig(shop: string): Record<string, unknown> | undefined {
  return buttonConfigCache.get(shop);
}

export function setCachedButtonConfig(shop: string, config: Record<string, unknown>): void {
  buttonConfigCache.set(shop, config);
}

export function invalidateButtonConfig(shop: string): void {
  buttonConfigCache.delete(shop);
}
