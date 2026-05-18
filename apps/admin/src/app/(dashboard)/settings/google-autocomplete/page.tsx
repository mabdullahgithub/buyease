import { revalidatePath } from "next/cache";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { db } from "@buyease/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/admin-session";
import { GoogleAcForm } from "./google-ac-form";

async function getGoogleAcConfig() {
  // upsert avoids a race condition on first access (findUnique + create would conflict
  // if two requests arrive simultaneously before the row exists).
  return db.googleAutocompleteGlobalConfig.upsert({
    where: { id: 1 },
    create: { id: 1, pricePerSession: 0.05, pricePerGeocode: 0.01, isEnabled: true },
    update: {},
  });
}

async function saveGoogleAcConfig(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const apiKey = String(formData.get("apiKey") ?? "").trim() || null;
  const pricePerSession = parseFloat(String(formData.get("pricePerSession") ?? "0.05"));
  const pricePerGeocode = parseFloat(String(formData.get("pricePerGeocode") ?? "0.01"));
  const isEnabled = formData.get("isEnabled") === "on";

  if (isNaN(pricePerSession) || pricePerSession < 0) {
    return { success: false, error: "Invalid session price." };
  }
  if (pricePerSession > 1) {
    return { success: false, error: "Session price cannot exceed $1.00." };
  }
  if (isNaN(pricePerGeocode) || pricePerGeocode < 0) {
    return { success: false, error: "Invalid geocode price." };
  }
  if (pricePerGeocode > 1) {
    return { success: false, error: "Geocode price cannot exceed $1.00." };
  }

  await db.googleAutocompleteGlobalConfig.upsert({
    where: { id: 1 },
    create: { id: 1, apiKey, pricePerSession, pricePerGeocode, isEnabled },
    update: { apiKey, pricePerSession, pricePerGeocode, isEnabled },
  });

  revalidatePath("/settings/google-autocomplete");
  return { success: true };
}

export default async function GoogleAcSettingsPage() {
  await requireAdminSession();

  const [config, totalSessions, totalRevenue, merchantGroups] = await Promise.all([
    getGoogleAcConfig(),
    db.googleAutocompleteUsageLog.count(),
    db.googleAutocompleteUsageLog.aggregate({ _sum: { costUsd: true } }),
    db.googleAutocompleteUsageLog.groupBy({ by: ["shop"] }),
  ]);

  const merchantCount = merchantGroups.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Google Address Autocomplete
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the Google Places API key, session pricing, and feature
          availability. Merchants are charged from their credit balance on every
          autocomplete session or geocode request.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4" />
              Total sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              autocomplete + geocode
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${Number(totalRevenue._sum.costUsd ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              from usage charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" />
              Active merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{merchantCount}</p>
            <p className="text-xs text-muted-foreground">
              with at least one session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Config form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4" />
            Provider configuration
          </CardTitle>
          <CardDescription>
            The API key is shared across all merchant stores. If left blank, the
            GOOGLE_PLACES_API_KEY environment variable is used as a fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleAcForm
            config={{
              apiKey: config.apiKey,
              pricePerSession: Number(config.pricePerSession),
              pricePerGeocode: Number(config.pricePerGeocode),
              isEnabled: config.isEnabled,
            }}
            saveAction={saveGoogleAcConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}
