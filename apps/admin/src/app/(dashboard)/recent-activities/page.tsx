import { db } from "@buyease/db";
import { requireAdminSession } from "@/lib/admin-session";
import {
  ActivityLogClient,
  type ActivityLogEntry,
  type ActivityStats,
} from "./activity-log-client";

export const dynamic = "force-dynamic";

export default async function RecentActivitiesPage() {
  await requireAdminSession();
  const allLogs = await db.adminLoginActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
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

  return <ActivityLogClient logs={logs} stats={stats} />;
}
