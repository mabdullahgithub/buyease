import { Prisma, db } from "@buyease/db";

import { getEnvAllowlistIps, getEnvBlockedIps } from "@/lib/admin-network";

export type AdminIpAccessMode = "ALLOW_ALL" | "RESTRICTED_ALLOWLIST";

const IP_ACCESS_SETTINGS_SINGLETON_ID = 1;
const POLICY_CACHE_TTL_MS = 3_000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

let allowlistCache: CacheEntry<Set<string>> | null = null;
let blockedCache: CacheEntry<Set<string>> | null = null;
let modeCache: CacheEntry<AdminIpAccessMode | null> | null = null;

function now(): number {
  return Date.now();
}

function readCache<T>(entry: CacheEntry<T> | null): T | null {
  if (!entry) return null;
  if (entry.expiresAt <= now()) return null;
  return entry.value;
}

function writeCache<T>(value: T): CacheEntry<T> {
  return { value, expiresAt: now() + POLICY_CACHE_TTL_MS };
}

export function invalidateAdminIpPolicyCache(): void {
  allowlistCache = null;
  blockedCache = null;
  modeCache = null;
}

function isMissingTableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}

function isPoolTimeoutError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2024"
  );
}

function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("can't reach database server") ||
    message.includes("failed to connect to database") ||
    message.includes("connection refused")
  );
}

function isSafeIpPolicyFallbackError(error: unknown): boolean {
  return (
    isMissingTableError(error) ||
    isPoolTimeoutError(error) ||
    isDatabaseUnavailableError(error)
  );
}

async function getDbAllowlistIps(): Promise<Set<string>> {
  const cached = readCache(allowlistCache);
  if (cached) return new Set(cached);

  try {
    const ips =
      (await db.adminIpAllowlist?.findMany({
        where: { isActive: true },
        select: { ip: true },
      })) ?? [];
    const next = new Set(ips.map((entry) => entry.ip));
    allowlistCache = writeCache(next);
    return new Set(next);
  } catch (error) {
    if (isSafeIpPolicyFallbackError(error)) {
      return new Set<string>();
    }
    throw error;
  }
}

async function getDbBlockedIps(): Promise<Set<string>> {
  const cached = readCache(blockedCache);
  if (cached) return new Set(cached);

  try {
    const ips =
      (await db.adminIpBlocklist?.findMany({
        where: { isActive: true },
        select: { ip: true },
      })) ?? [];
    const next = new Set(ips.map((entry) => entry.ip));
    blockedCache = writeCache(next);
    return new Set(next);
  } catch (error) {
    if (isSafeIpPolicyFallbackError(error)) {
      return new Set<string>();
    }
    throw error;
  }
}

export async function getConfiguredIpAccessMode(): Promise<AdminIpAccessMode | null> {
  const cached = readCache(modeCache);
  if (cached !== null) return cached;

  try {
    const settings = await db.adminIpAccessSetting?.findUnique({
      where: { id: IP_ACCESS_SETTINGS_SINGLETON_ID },
      select: { allowlistMode: true },
    });

    const resolved = settings?.allowlistMode ?? null;
    modeCache = writeCache(resolved);
    return resolved;
  } catch (error) {
    if (isSafeIpPolicyFallbackError(error)) return null;
    throw error;
  }
}

export async function resolveIpAccessMode(): Promise<AdminIpAccessMode> {
  const configuredMode = await getConfiguredIpAccessMode();
  if (configuredMode) return configuredMode;

  // Legacy fallback for environments where the settings table is not migrated yet.
  const envAllowlist = getEnvAllowlistIps();
  if (envAllowlist.size > 0) return "RESTRICTED_ALLOWLIST";

  try {
    const activeDbAllowlistCount = await db.adminIpAllowlist.count({
      where: { isActive: true },
    });
    return activeDbAllowlistCount > 0 ? "RESTRICTED_ALLOWLIST" : "ALLOW_ALL";
  } catch (error) {
    if (isSafeIpPolicyFallbackError(error)) {
      return "ALLOW_ALL";
    }
    throw error;
  }
}

export async function setIpAccessMode(params: {
  mode: AdminIpAccessMode;
  updatedById: string;
}): Promise<void> {
  if (!db.adminIpAccessSetting) {
    throw new Error("IP_ACCESS_SETTINGS_UNAVAILABLE");
  }

  await db.adminIpAccessSetting.upsert({
    where: { id: IP_ACCESS_SETTINGS_SINGLETON_ID },
    update: {
      allowlistMode: params.mode,
      updatedById: params.updatedById,
    },
    create: {
      id: IP_ACCESS_SETTINGS_SINGLETON_ID,
      allowlistMode: params.mode,
      updatedById: params.updatedById,
    },
  });

  modeCache = writeCache(params.mode);
}

export async function getEffectiveAllowlistIps(): Promise<Set<string>> {
  const envIps = getEnvAllowlistIps();
  const dbIps = await getDbAllowlistIps();
  return new Set([...envIps, ...dbIps]);
}

export async function getEffectiveBlockedIps(): Promise<Set<string>> {
  const envIps = getEnvBlockedIps();
  const dbIps = await getDbBlockedIps();
  return new Set([...envIps, ...dbIps]);
}

export async function isIpAllowedForAdminAccess(ip: string): Promise<boolean> {
  const blockedIps = await getEffectiveBlockedIps();
  if (ip && blockedIps.has(ip)) return false;

  const accessMode = await resolveIpAccessMode();
  if (accessMode === "ALLOW_ALL") return true;

  const allowlistIps = await getEffectiveAllowlistIps();
  return !!ip && allowlistIps.has(ip);
}
