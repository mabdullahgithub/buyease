import { db } from "@buyease/db";
import { Badge } from "@buyease/ui";
import { Activity, Globe, Laptop } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatLocation(city: string | null, region: string | null, country: string | null): string {
  const parts = [city, region, country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}

export default async function RecentActivitiesPage() {
  const activities = await db.adminLoginActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      ip: true,
      userAgent: true,
      successful: true,
      failureReason: true,
      locationCity: true,
      locationRegion: true,
      locationCountry: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recent activities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Authentication events with IP, device, and coarse location metadata.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            Sign-in activity feed
          </CardTitle>
          <CardDescription>Most recent 100 login attempts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {activities.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No activity found yet.
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{activity.email ?? "Unknown account"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={activity.successful ? "success" : "destructive"}>
                    {activity.successful ? "Success" : "Failed"}
                  </Badge>
                </div>

                <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Globe className="size-3.5" />
                    {activity.ip} •{" "}
                    {formatLocation(activity.locationCity, activity.locationRegion, activity.locationCountry)}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Laptop className="size-3.5" />
                    {activity.userAgent ?? "Unknown device"}
                  </p>
                  {!activity.successful && activity.failureReason ? (
                    <p className="text-destructive/90">Reason: {activity.failureReason}</p>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
