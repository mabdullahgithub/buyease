import { db } from "@buyease/db";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-session";
import {
  ActivityLogClient,
  type ActivityLogEntry,
  type ActivityStats,
} from "./activity-log-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

type SearchParams = Promise<{
  cursor?: string;
  direction?: "next" | "prev";
}>;

export default async function RecentActivitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const cursor = params.cursor;
  const direction = params.direction === "prev" ? "prev" : "next";
  const isPrev = direction === "prev" && Boolean(cursor);

  const rows = await db.adminLoginActivity.findMany({
    orderBy: { id: isPrev ? "asc" : "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      email: true,
      ip: true,
      userAgent: true,
      locationCity: true,
      locationRegion: true,
      locationCountry: true,
      successful: true,
      failureReason: true,
      createdAt: true,
      adminUser: { select: { role: true } },
    },
  });
  const hasExtraRow = rows.length > PAGE_SIZE;
  const slicedRows = hasExtraRow ? rows.slice(0, PAGE_SIZE) : rows;
  const allLogs = isPrev ? slicedRows.reverse() : slicedRows;
  const loginOnlyLogs = allLogs.filter(
    (log) => !(log.userAgent ?? "").startsWith("SETTINGS_EVENT:")
  );
  const successCount = loginOnlyLogs.filter((log) => log.successful).length;
  const failCount = loginOnlyLogs.length - successCount;
  const uniqueIpCount = new Set(loginOnlyLogs.map((log) => log.ip)).size;

  const logs: ActivityLogEntry[] = allLogs.map((log) => {
    const userAgent = log.userAgent ?? "";
    const isSettingsEvent = userAgent.startsWith("SETTINGS_EVENT:");
    const [, category = null, action = null] = userAgent.split(":");

    return {
      id: log.id,
      type: isSettingsEvent ? ("SETTINGS" as const) : ("LOGIN" as const),
      email: log.email,
      ip: log.ip,
      userAgent: isSettingsEvent ? null : log.userAgent,
      locationCity: log.locationCity,
      locationRegion: log.locationRegion,
      locationCountry: log.locationCountry,
      successful: log.successful,
      failureReason: log.failureReason,
      createdAt: log.createdAt.toISOString(),
      adminUserRole: log.adminUser?.role ?? null,
      action,
      category,
      description: isSettingsEvent ? log.failureReason ?? null : null,
      status: isSettingsEvent ? (log.successful ? "SUCCESS" : "FAILED") : null,
    };
  });

  const settingsCount = logs.filter((log) => log.type === "SETTINGS").length;

  const stats: ActivityStats = {
    totalEvents: logs.length,
    successfulLogins: successCount,
    failedLogins: failCount,
    uniqueIps: uniqueIpCount,
    settingsChanges: settingsCount,
  };

  const hasNextPage = isPrev ? Boolean(cursor) : hasExtraRow;
  const hasPrevPage = isPrev ? hasExtraRow : Boolean(cursor);
  const startCursor = allLogs[0]?.id ?? null;
  const endCursor = allLogs[allLogs.length - 1]?.id ?? null;
  const createHref = (nextCursor: string | null, nextDirection: "next" | "prev") => {
    if (!nextCursor) return "/recent-activities";
    const nextParams = new URLSearchParams();
    nextParams.set("cursor", nextCursor);
    nextParams.set("direction", nextDirection);
    return `/recent-activities?${nextParams.toString()}`;
  };

  return (
    <div className="space-y-4">
      <ActivityLogClient logs={logs} stats={stats} />
      <div className="flex items-center justify-end gap-3">
        {hasPrevPage ? (
          <Link
            href={createHref(startCursor, "prev")}
            className="text-xs text-primary hover:underline"
          >
            Previous
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Previous</span>
        )}
        {hasNextPage ? (
          <Link
            href={createHref(endCursor, "next")}
            className="text-xs text-primary hover:underline"
          >
            Next
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Next</span>
        )}
      </div>
    </div>
  );
}
