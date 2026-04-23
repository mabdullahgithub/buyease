import "@shopify/shopify-api/adapters/node";
import { ApiVersion, LogSeverity, shopifyApi } from "@shopify/shopify-api";
import { RedisSessionStorage } from "@shopify/shopify-app-session-storage-redis";

export const sessionStorage = new RedisSessionStorage(process.env.REDIS_URL!);

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  hostName: process.env.HOST!.replace(/https?:\/\//, ""),
  apiVersion: ApiVersion.April26,
  isEmbeddedApp: true,
  logger: {
    level: LogSeverity.Warning,
  },
});

export default shopify;
