import { revalidatePath } from "next/cache";
import { Construction } from "lucide-react";
import { db } from "@buyease/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/admin-session";

import { MaintenanceForm } from "./maintenance-form";

async function getAppSettings() {
  const settings = await db.appSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;

  return db.appSettings.create({
    data: {
      id: 1,
      maintenanceEnabled: false,
      maintenanceMessage: "BuyEase is undergoing scheduled maintenance. Please try again shortly.",
      maintenanceRetryAfter: 300,
    },
  });
}

async function toggleMaintenance(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const enabled = formData.get("enabled") === "true";

  await db.appSettings.upsert({
    where: { id: 1 },
    update: { maintenanceEnabled: enabled },
    create: {
      id: 1,
      maintenanceEnabled: enabled,
      maintenanceMessage: "BuyEase is undergoing scheduled maintenance. Please try again shortly.",
      maintenanceRetryAfter: 300,
    },
  });

  revalidatePath("/settings/maintenance");
  return { success: true };
}

async function updateMaintenanceSettings(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const message = String(formData.get("message") ?? "").trim();
  const retryAfter = parseInt(String(formData.get("retryAfter") ?? "300"), 10);

  if (!message) {
    return { success: false, error: "Message cannot be empty." };
  }
  if (isNaN(retryAfter) || retryAfter < 30 || retryAfter > 86400) {
    return { success: false, error: "Retry-After must be between 30 and 86400 seconds." };
  }

  await db.appSettings.upsert({
    where: { id: 1 },
    update: { maintenanceMessage: message, maintenanceRetryAfter: retryAfter },
    create: {
      id: 1,
      maintenanceEnabled: false,
      maintenanceMessage: message,
      maintenanceRetryAfter: retryAfter,
    },
  });

  revalidatePath("/settings/maintenance");
  return { success: true };
}

export default async function MaintenanceSettingsPage() {
  await requireAdminSession();

  const settings = await getAppSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Maintenance mode
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Temporarily disable the merchant app during deployments or emergencies.
          Changes take effect within 10 seconds.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="size-4" />
            Maintenance control
          </CardTitle>
          <CardDescription>
            When enabled, all merchant API routes return 503 Service Unavailable
            with the configured message and Retry-After header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceForm
            enabled={settings.maintenanceEnabled}
            message={settings.maintenanceMessage}
            retryAfter={settings.maintenanceRetryAfter}
            toggleAction={toggleMaintenance}
            updateAction={updateMaintenanceSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
}
