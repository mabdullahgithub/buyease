import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const checks: Record<string, boolean> = {
    database: false,
    maintenance: false,
  };

  try {
    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
    checks.database = result.length > 0;
  } catch {
    checks.database = false;
  }

  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
      select: { maintenanceEnabled: true },
    });
    checks.maintenance = settings?.maintenanceEnabled ?? false;
  } catch {
    checks.maintenance = false;
  }

  const healthy = checks.database;
  const status = healthy ? "healthy" : "unhealthy";

  return NextResponse.json(
    { status, ...checks },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
