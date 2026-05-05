import { NextResponse } from "next/server";
import { db } from "@buyease/db";

import { auth } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.appSettings.findUnique({
    where: { id: 1 },
    select: { maintenanceEnabled: true },
  });

  return NextResponse.json(
    { enabled: settings?.maintenanceEnabled ?? false },
    { headers: { "Cache-Control": "private, max-age=10" } },
  );
}
