import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Prisma, db } from "@buyease/db";
import { Ban, Globe, Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/admin-session";
import { getEnvAllowlistIps, normalizeIp } from "@/lib/admin-network";

import {
  AddAllowlistForm,
  AddBlocklistForm,
  RemoveIpButton,
} from "./ip-forms";

function isValidIpAddress(value: string): boolean {
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv4.test(value) || ipv6.test(value);
}

function isMissingTableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}

async function addAllowlistedIp(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const ip = normalizeIp(String(formData.get("ip") ?? ""));
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!isValidIpAddress(ip)) {
    return { success: false, error: "Invalid IP address format." };
  }

  try {
    await db.adminIpAllowlist.upsert({
      where: { ip },
      update: { isActive: true, label },
      create: { ip, label, isActive: true, createdById: session.user.id },
    });
  } catch {
    return { success: false, error: "Failed to add IP. Please try again." };
  }

  revalidatePath("/settings/system");
  return { success: true };
}

async function removeAllowlistedIp(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Missing ID." };

  try {
    await db.adminIpAllowlist.update({
      where: { id },
      data: { isActive: false },
    });
  } catch {
    return { success: false, error: "Failed to remove IP." };
  }

  revalidatePath("/settings/system");
  return { success: true };
}

async function addBlockedIp(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const ip = normalizeIp(String(formData.get("ip") ?? ""));
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!isValidIpAddress(ip)) {
    return { success: false, error: "Invalid IP address format." };
  }

  try {
    await db.adminIpBlocklist.upsert({
      where: { ip },
      update: { isActive: true, label },
      create: { ip, label, isActive: true, createdById: session.user.id },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return { success: false, error: "Blocklist table not found. Run migrations." };
    }
    return { success: false, error: "Failed to block IP. Please try again." };
  }

  revalidatePath("/settings/system");
  return { success: true };
}

async function removeBlockedIp(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Missing ID." };

  try {
    await db.adminIpBlocklist.update({
      where: { id },
      data: { isActive: false },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return { success: false, error: "Blocklist table not found." };
    }
    return { success: false, error: "Failed to unblock IP." };
  }

  revalidatePath("/settings/system");
  return { success: true };
}

export default async function SystemSettingsPage() {
  await requireAdminSession();

  const blockedIpsPromise = db.adminIpBlocklist
    .findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ip: true,
        label: true,
        createdBy: { select: { email: true } },
      },
    })
    .catch((error) => {
      if (isMissingTableError(error)) return [];
      throw error;
    });

  const [dbIps, blockedIps, mostUsedIps] = await Promise.all([
    db.adminIpAllowlist.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ip: true,
        label: true,
        createdAt: true,
        createdBy: { select: { email: true } },
      },
    }),
    blockedIpsPromise,
    db.adminLoginActivity.groupBy({
      by: ["ip"],
      _count: { ip: true },
      orderBy: { _count: { ip: "desc" } },
      take: 5,
    }).catch(() => []),
  ]);

  const envIps = [...getEnvAllowlistIps()];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          System settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Security-first controls for admin access and activity telemetry.
        </p>
      </div>

      {/* IP Allowlisting + Environment allowlist */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <Card className="xl:row-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4" />
              IP allowlisting
            </CardTitle>
            <CardDescription>
              Add trusted IP addresses for admin panel access. Keyboard-first:
              press{" "}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              on the IP field to add quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AddAllowlistForm action={addAllowlistedIp} />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active DB allowlist entries
              </p>
              {dbIps.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No database-managed IPs yet.
                </p>
              ) : (
                <div className="space-y-2 pr-1 max-h-[260px] overflow-y-auto">
                  {dbIps.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm">{entry.ip}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.label || "No label"} &middot;{" "}
                          {entry.createdBy?.email ?? "unknown admin"}
                        </p>
                      </div>
                      <RemoveIpButton
                        id={entry.id}
                        ip={entry.ip}
                        action={removeAllowlistedIp}
                        label={`Remove ${entry.ip}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Environment allowlist</CardTitle>
            <CardDescription className="text-xs">
              Boot-time IPs from{" "}
              <code className="text-[11px]">ADMIN_WHITELISTED_IPS</code> /{" "}
              <code className="text-[11px]">ADMIN_ALLOWED_IPS</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {envIps.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No environment IPs configured.
              </p>
            ) : (
              <div className="space-y-1.5 pr-1 max-h-[260px] overflow-y-auto">
                {envIps.map((ip) => (
                  <div
                    key={ip}
                    className="rounded-md border px-2.5 py-1.5 font-mono text-xs"
                  >
                    {ip}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most used IPs */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Most used IPs</CardTitle>
            <CardDescription className="text-xs">
              Frequent login IPs from recent activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {mostUsedIps.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No activity recorded yet.
              </p>
            ) : (
              <div className="space-y-1.5 pr-1 max-h-[260px] overflow-y-auto">
                {mostUsedIps.map((entry) => (
                  <div
                    key={entry.ip}
                    className="flex justify-between rounded-md border px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono">{entry.ip}</span>
                    <span className="text-muted-foreground">{entry._count.ip} logins</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication activity link */}
        <Card className="h-fit bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 shrink-0 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Authentication activity</p>
                <p className="text-xs text-muted-foreground">View detailed admin login logs</p>
              </div>
            </div>
            <Link 
              href="/recent-activities" 
              className="text-xs font-semibold text-primary hover:underline whitespace-nowrap ml-4"
            >
              View logs &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Blocked IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="size-4" />
            Blocked IPs
          </CardTitle>
          <CardDescription>
            Any blocked IP is denied platform access immediately, even if it is
            allowlisted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <AddBlocklistForm action={addBlockedIp} />

          {blockedIps.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No blocked IPs configured.
            </p>
          ) : (
            <div className="space-y-2 pr-1 max-h-[260px] overflow-y-auto">
              {blockedIps.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{entry.ip}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.label || "No reason provided"} &middot;{" "}
                      {entry.createdBy?.email ?? "unknown admin"}
                    </p>
                  </div>
                  <RemoveIpButton
                    id={entry.id}
                    ip={entry.ip}
                    action={removeBlockedIp}
                    label={`Unblock ${entry.ip}`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
