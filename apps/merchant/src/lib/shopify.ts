import "@shopify/shopify-api/adapters/web-api";
import { ApiVersion, DeliveryMethod, LogSeverity, shopifyApi } from "@shopify/shopify-api";
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

const WEBHOOK_PATH = "/api/webhooks";

shopify.webhooks.addHandlers({
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_PATH,
  },
});

export default shopify;
