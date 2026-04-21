import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma, db } from "@buyease/db";

import { getClientIpFromHeaders, getEnvAllowlistIps, getEnvBlockedIps } from "@/lib/admin-network";

async function getDbAllowlistIps(): Promise<Set<string>> {
  try {
    const ips = await db.adminIpAllowlist?.findMany({
      where: { isActive: true },
      select: { ip: true },
    }) ?? [];
    return new Set(ips.map((entry) => entry.ip));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      // Table not migrated yet; fallback to env-only allowlist.
      return new Set<string>();
    }
    throw error;
  }
}

async function getDbBlockedIps(): Promise<Set<string>> {
  try {
    const ips = await db.adminIpBlocklist?.findMany({
      where: { isActive: true },
      select: { ip: true },
    }) ?? [];
    return new Set(ips.map((entry) => entry.ip));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return new Set<string>();
    }
    throw error;
  }
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

export async function isCurrentRequestIpAllowed(): Promise<boolean> {
  const requestHeaders = await headers();
  const ip = getClientIpFromHeaders(requestHeaders);
  const blocked = await getEffectiveBlockedIps();
  if (ip && blocked.has(ip)) return false;
  const allowlist = await getEffectiveAllowlistIps();
  if (allowlist.size === 0) return true;
  return !!ip && allowlist.has(ip);
}

export async function assertCurrentRequestIpAllowed(): Promise<void> {
  const allowed = await isCurrentRequestIpAllowed();
  if (!allowed) {
    redirect("/login");
  }
}
