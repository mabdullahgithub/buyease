import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  retryAfter: number;
};

const CACHE_TTL_MS = 10_000;
let cached: { status: MaintenanceStatus; expiresAt: number } | null = null;

async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  if (cached && Date.now() < cached.expiresAt) {
    return cached.status;
  }

  const row = await prisma.appSettings.findUnique({ where: { id: 1 } });

  const status: MaintenanceStatus = {
    enabled: row?.maintenanceEnabled ?? false,
    message: row?.maintenanceMessage ?? "BuyEase is undergoing scheduled maintenance. Please try again shortly.",
    retryAfter: row?.maintenanceRetryAfter ?? 300,
  };

  cached = { status, expiresAt: Date.now() + CACHE_TTL_MS };
  return status;
}

/**
 * Returns a 503 response if maintenance mode is active, or null if the app is operating normally.
 * Reads from AppSettings table (cached 10s in-memory to avoid per-request DB hits).
 * Admin toggles maintenance from the admin panel — takes effect within 10 seconds.
 */
export async function checkMaintenance(): Promise<NextResponse | null> {
  const { enabled, message, retryAfter } = await getMaintenanceStatus();

  if (!enabled) return null;

  return NextResponse.json(
    { error: "Service Unavailable", message },
    {
      status: 503,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}
