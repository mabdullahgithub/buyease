import { Prisma, db } from "@buyease/db";

import { getEnvAllowlistIps, getEnvBlockedIps } from "@/lib/admin-network";

export type AdminIpAccessMode = "ALLOW_ALL" | "RESTRICTED_ALLOWLIST";

const IP_ACCESS_SETTINGS_SINGLETON_ID = 1;

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

async function getDbAllowlistIps(): Promise<Set<string>> {
  try {
    const ips =
      (await db.adminIpAllowlist?.findMany({
        where: { isActive: true },
        select: { ip: true },
      })) ?? [];
    return new Set(ips.map((entry) => entry.ip));
  } catch (error) {
    if (isMissingTableError(error) || isPoolTimeoutError(error)) {
      return new Set<string>();
    }
    throw error;
  }
}

async function getDbBlockedIps(): Promise<Set<string>> {
  try {
    const ips =
      (await db.adminIpBlocklist?.findMany({
        where: { isActive: true },
        select: { ip: true },
      })) ?? [];
    return new Set(ips.map((entry) => entry.ip));
  } catch (error) {
    if (isMissingTableError(error) || isPoolTimeoutError(error)) {
      return new Set<string>();
    }
    throw error;
  }
}

export async function getConfiguredIpAccessMode(): Promise<AdminIpAccessMode | null> {
  try {
    const settings = await db.adminIpAccessSetting?.findUnique({
      where: { id: IP_ACCESS_SETTINGS_SINGLETON_ID },
      select: { allowlistMode: true },
    });

    return settings?.allowlistMode ?? null;
  } catch (error) {
    if (isMissingTableError(error) || isPoolTimeoutError(error)) return null;
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
    if (isMissingTableError(error) || isPoolTimeoutError(error)) {
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
