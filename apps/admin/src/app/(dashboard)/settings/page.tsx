"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Input,
} from "@buyease/ui";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@buyease/ui";

type SettingsState = {
  maintenanceMode: boolean;
  allowedIPs: string;
  defaultPlanId: string;
  supportEmail: string;
  appVersion: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    maintenanceMode: false,
    allowedIPs: "127.0.0.1, ::1",
    defaultPlanId: "",
    supportEmail: "support@buyease.app",
    appVersion: "0.1.0",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global platform configuration
          </p>
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="size-4" />
          ) : null}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>
            When enabled, all merchant app routes return a maintenance page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    maintenanceMode: e.target.checked,
                  }))
                }
              />
              <div
                className={cn(
                  "w-10 h-5 rounded-full transition-colors",
                  settings.maintenanceMode ? "bg-primary" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                    settings.maintenanceMode ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </div>
            </div>
            <span className="text-sm font-medium">
              {settings.maintenanceMode ? (
                <Badge variant="destructive">Maintenance Active</Badge>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IP Allowlist</CardTitle>
          <CardDescription>
            Comma-separated IPs allowed to access the admin panel.
            Changes take effect on next deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={settings.allowedIPs}
            onChange={(e) =>
              setSettings((s) => ({ ...s, allowedIPs: e.target.value }))
            }
            placeholder="127.0.0.1, 10.0.0.1"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Set via <code className="font-mono">ADMIN_ALLOWED_IPS</code> env var
            in production.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Support Email
            </label>
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings((s) => ({ ...s, supportEmail: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              App Version
            </label>
            <Input
              value={settings.appVersion}
              onChange={(e) =>
                setSettings((s) => ({ ...s, appVersion: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
