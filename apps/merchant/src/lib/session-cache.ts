import { Session } from "@shopify/shopify-api";
import { LRUCache } from "lru-cache";

import { prisma } from "@/lib/db";
import { sessionStorage } from "@/lib/shopify";

const memoryCache = new LRUCache<string, Session>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

export async function getCachedSession(sessionId: string): Promise<Session | undefined> {
  const memorySession = memoryCache.get(sessionId);
  if (memorySession) {
    return memorySession;
  }

  try {
    const redisSession = await sessionStorage.loadSession(sessionId);
    if (redisSession) {
      memoryCache.set(sessionId, redisSession);
      return redisSession;
    }
  } catch (error) {
    console.warn("Redis session load failed, fallback to DB", error);
  }

  const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!dbSession) {
    return undefined;
  }

  const session = new Session({
    id: dbSession.id,
    shop: dbSession.shop,
    state: dbSession.state ?? "",
    isOnline: dbSession.isOnline,
    scope: dbSession.scope ?? undefined,
    expires: dbSession.expires ?? undefined,
    accessToken: dbSession.accessToken ?? "",
  });

  memoryCache.set(sessionId, session);
  await sessionStorage.storeSession(session);
  return session;
}

export async function saveSession(session: Session): Promise<void> {
  await Promise.all([
    sessionStorage.storeSession(session),
    prisma.session.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        shop: session.shop,
        state: session.state ?? "",
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken ?? "",
        firstName: (session as { firstName?: string }).firstName,
        lastName: (session as { lastName?: string }).lastName,
        email: (session as { email?: string }).email,
      },
      update: {
        state: session.state ?? "",
        accessToken: session.accessToken ?? "",
        scope: session.scope,
        expires: session.expires,
      },
    }),
  ]);

  memoryCache.set(session.id, session);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await Promise.all([
    sessionStorage.deleteSession(sessionId),
    prisma.session.deleteMany({ where: { id: sessionId } }),
  ]);
  memoryCache.delete(sessionId);
}
