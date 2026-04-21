import { revalidatePath } from "next/cache";
import { Prisma, db } from "@buyease/db";
import { Badge } from "@buyease/ui";
import { Ban, Globe, Keyboard, Plus, Shield, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdminSession } from "@/lib/admin-session";
import { getEnvAllowlistIps, normalizeIp } from "@/lib/admin-network";

function isValidIpAddress(value: string): boolean {
  const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv4.test(value) || ipv6.test(value);
}

function isMissingTableError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

async function addAllowlistedIp(formData: FormData): Promise<void> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") return;

  const ip = normalizeIp(String(formData.get("ip") ?? ""));
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!isValidIpAddress(ip)) return;

  await db.adminIpAllowlist.upsert({
    where: { ip },
    update: { isActive: true, label },
    create: { ip, label, isActive: true, createdById: session.user.id },
  });

  revalidatePath("/settings/system");
}

async function removeAllowlistedIp(formData: FormData): Promise<void> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.adminIpAllowlist.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/settings/system");
}

async function addBlockedIp(formData: FormData): Promise<void> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") return;

  const ip = normalizeIp(String(formData.get("ip") ?? ""));
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!isValidIpAddress(ip)) return;

  try {
    await db.adminIpBlocklist.upsert({
      where: { ip },
      update: { isActive: true, label },
      create: { ip, label, isActive: true, createdById: session.user.id },
    });
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
  }

  revalidatePath("/settings/system");
}

async function removeBlockedIp(formData: FormData): Promise<void> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    await db.adminIpBlocklist.update({
      where: { id },
      data: { isActive: false },
    });
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
  }

  revalidatePath("/settings/system");
}

export default async function SystemSettingsPage() {
  const session = await requireAdminSession();
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

  const [dbIps, blockedIps, recentAuthEvents] = await Promise.all([
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
    db.adminLoginActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        ip: true,
        userAgent: true,
        successful: true,
        createdAt: true,
        locationCity: true,
        locationCountry: true,
        email: true,
      },
    }),
  ]);
  const envIps = [...getEnvAllowlistIps()];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Security-first controls for admin access and activity telemetry.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Shield className="size-3.5" />
          {session.user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4" />
              IP allowlisting
            </CardTitle>
            <CardDescription>
              Add trusted IP addresses for admin panel access. Keyboard-first: press{" "}
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
              on the IP field to add quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form action={addAllowlistedIp} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="ip">IP address</Label>
                <Input id="ip" name="ip" required placeholder="203.0.113.10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" placeholder="Office VPN" />
              </div>
              <div className="md:pt-7">
                <Button type="submit" className="w-full md:w-auto">
                  <Plus className="size-4" />
                  Add IP
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Keyboard className="size-3.5" />
                Active DB allowlist entries
              </div>
              <div className="space-y-2">
                {dbIps.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No database-managed IPs yet.
                  </p>
                ) : (
                  dbIps.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm">{entry.ip}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.label || "No label"} • by {entry.createdBy?.email ?? "unknown admin"}
                        </p>
                      </div>
                      <form action={removeAllowlistedIp}>
                        <input type="hidden" name="id" value={entry.id} />
                        <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Remove ${entry.ip}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment allowlist</CardTitle>
            <CardDescription>
              Boot-time IPs from `ADMIN_WHITELISTED_IPS` / `ADMIN_ALLOWED_IPS`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {envIps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No environment IPs configured.</p>
            ) : (
              envIps.map((ip) => (
                <div key={ip} className="rounded-md border px-2.5 py-2 font-mono text-xs">
                  {ip}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="size-4" />
            Blocked IPs
          </CardTitle>
          <CardDescription>
            Any blocked IP is denied platform access immediately, even if it is allowlisted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={addBlockedIp} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="blocked-ip">IP address</Label>
              <Input id="blocked-ip" name="ip" required placeholder="198.51.100.42" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blocked-label">Reason</Label>
              <Input id="blocked-label" name="label" placeholder="Suspicious traffic" />
            </div>
            <div className="md:pt-7">
              <Button type="submit" variant="destructive" className="w-full md:w-auto">
                <Ban className="size-4" />
                Block IP
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {blockedIps.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No blocked IPs configured.
              </p>
            ) : (
              blockedIps.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{entry.ip}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.label || "No reason provided"} • by {entry.createdBy?.email ?? "unknown admin"}
                    </p>
                  </div>
                  <form action={removeBlockedIp}>
                    <input type="hidden" name="id" value={entry.id} />
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Unblock ${entry.ip}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent authentication events</CardTitle>
          <CardDescription>Last six sign-in attempts from all admin accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAuthEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No authentication events yet.</p>
          ) : (
            recentAuthEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{event.email ?? "Unknown account"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.ip} • {event.locationCity ?? "Unknown city"}, {event.locationCountry ?? "Unknown country"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{event.userAgent ?? "Unknown device"}</p>
                </div>
                <Badge variant={event.successful ? "success" : "destructive"}>
                  {event.successful ? "Success" : "Failed"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
