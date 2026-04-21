import { requireAdminSession } from "@/lib/admin-session";
import { ChangePasswordForm } from "./change-password-form";

type ActiveSessionItem = {
  id: string;
  device: string;
  location: string;
  isCurrent: boolean;
  lastSeen: string;
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function AccountSecurityPage() {
  const session = await requireAdminSession();
  const email = session.user.email ?? "";

  const { db } = await import("@buyease/db");
  const [admin, recentLogins] = await Promise.all([
    db.adminUser.findFirst({
      where: { email, isActive: true },
      select: { twoFactorEnabled: true },
    }),
    db.adminLoginActivity.findMany({
      where: {
        successful: true,
        ...(email ? { email } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        ip: true,
        userAgent: true,
        locationCity: true,
        locationCountry: true,
        createdAt: true,
      },
    }),
  ]);

  const uniqueByDevice = new Map<string, ActiveSessionItem>();
  for (const login of recentLogins) {
    const deviceKey = `${login.userAgent ?? "Unknown device"}-${login.ip}`;
    if (uniqueByDevice.has(deviceKey)) continue;

    const device = login.userAgent
      ? login.userAgent.split(" ").slice(0, 3).join(" ")
      : "Unknown device";
    const location = [login.locationCity, login.locationCountry]
      .filter(Boolean)
      .join(", ") || login.ip;

    uniqueByDevice.set(deviceKey, {
      id: login.id,
      device,
      location,
      isCurrent: uniqueByDevice.size === 0,
      lastSeen: formatRelativeTime(login.createdAt),
    });
  }

  const activeSessions = Array.from(uniqueByDevice.values());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security and authentication methods. Signed in as{" "}
          <span className="font-mono text-foreground">{session.user.email}</span>
        </p>
      </div>

      <ChangePasswordForm
        activeSessions={activeSessions}
        userEmail={email}
        initialTwoFactorEnabled={admin?.twoFactorEnabled ?? false}
      />
    </div>
  );
}
