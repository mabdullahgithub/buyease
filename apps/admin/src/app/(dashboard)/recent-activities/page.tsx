import { db } from "@buyease/db";
import { requireAdminSession } from "@/lib/admin-session";
import {
  ActivityLogClient,
  type ActivityLogEntry,
  type ActivityStats,
} from "./activity-log-client";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 100;
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

type SearchParams = Promise<{
  cursor?: string;
  direction?: "next" | "prev";
  pageSize?: string;
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
  const requestedPageSize = Number.parseInt(params.pageSize ?? `${DEFAULT_PAGE_SIZE}`, 10);
  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? requestedPageSize
    : DEFAULT_PAGE_SIZE;
  const isPrev = direction === "prev" && Boolean(cursor);

  const rows = await db.adminLoginActivity.findMany({
    orderBy: { id: isPrev ? "asc" : "desc" },
    take: pageSize + 1,
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
  const hasExtraRow = rows.length > pageSize;
  const slicedRows = hasExtraRow ? rows.slice(0, pageSize) : rows;
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
    const nextParams = new URLSearchParams();
    nextParams.set("pageSize", String(pageSize));
    if (nextCursor) {
      nextParams.set("cursor", nextCursor);
      nextParams.set("direction", nextDirection);
    }
    const queryString = nextParams.toString();
    return queryString ? `/recent-activities?${queryString}` : "/recent-activities";
  };

  return (
    <ActivityLogClient
      logs={logs}
      stats={stats}
      pagination={{
        rowsPerPage: pageSize,
        rowOptions: [...PAGE_SIZE_OPTIONS],
        previousHref: hasPrevPage ? createHref(startCursor, "prev") : null,
        nextHref: hasNextPage ? createHref(endCursor, "next") : null,
      }}
    />
  );
}
