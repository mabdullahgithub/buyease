import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
import { db } from "@buyease/db";

if (!process.env.SHOPIFY_API_KEY) throw new Error("SHOPIFY_API_KEY is required");
if (!process.env.SHOPIFY_API_SECRET) throw new Error("SHOPIFY_API_SECRET is required");
if (!process.env.SHOPIFY_APP_URL) throw new Error("SHOPIFY_APP_URL is required");

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: (process.env.SHOPIFY_SCOPES ?? "read_orders,write_orders,read_products").split(","),
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.January25,
  isEmbeddedApp: true,
  sessionStorage: {
    async storeSession(session: Session): Promise<boolean> {
      await db.session.upsert({
        where: { id: session.id },
        update: {
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires,
          accessToken: session.accessToken || "",
          userId: session.onlineAccessInfo?.associated_user?.id
            ? BigInt(session.onlineAccessInfo.associated_user.id)
            : null,
        },
        create: {
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires,
          accessToken: session.accessToken || "",
          userId: session.onlineAccessInfo?.associated_user?.id
            ? BigInt(session.onlineAccessInfo.associated_user.id)
            : null,
        },
      });
      return true;
    },

    async loadSession(id: string): Promise<Session | undefined> {
      const row = await db.session.findUnique({ where: { id } });
      if (!row) return undefined;

      const session = new Session({
        id: row.id,
        shop: row.shop,
        state: row.state,
        isOnline: row.isOnline,
      });
      session.scope = row.scope ?? undefined;
      session.expires = row.expires ?? undefined;
      session.accessToken = row.accessToken;
      return session;
    },

    async deleteSession(id: string): Promise<boolean> {
      await db.session.deleteMany({ where: { id } });
      return true;
    },

    async deleteSessions(ids: string[]): Promise<boolean> {
      await db.session.deleteMany({ where: { id: { in: ids } } });
      return true;
    },

    async findSessionsByShop(shop: string): Promise<Session[]> {
      const rows = await db.session.findMany({ where: { shop } });
      return rows.map((row) => {
        const s = new Session({ id: row.id, shop: row.shop, state: row.state, isOnline: row.isOnline });
        s.scope = row.scope ?? undefined;
        s.expires = row.expires ?? undefined;
        s.accessToken = row.accessToken;
        return s;
      });
    },
  },
});
