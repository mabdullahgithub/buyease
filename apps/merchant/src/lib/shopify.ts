import "@shopify/shopify-api/adapters/node";
import { ApiVersion, LogSeverity, shopifyApi } from "@shopify/shopify-api";
import { RedisSessionStorage } from "@shopify/shopify-app-session-storage-redis";

import { merchantAppHostname } from "@/lib/merchant-app-url";

function parseCommaList(value: string | undefined): string[] {
  const trimmed = value?.trim();
  if (!trimmed) return [];
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

export const sessionStorage = new RedisSessionStorage(redisUrl);

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: parseCommaList(process.env.SHOPIFY_SCOPES ?? process.env.SCOPES),
  hostName: merchantAppHostname(),
  apiVersion: ApiVersion.April26,
  isEmbeddedApp: true,
  logger: {
    level: LogSeverity.Warning,
  },
});

export default shopify;
