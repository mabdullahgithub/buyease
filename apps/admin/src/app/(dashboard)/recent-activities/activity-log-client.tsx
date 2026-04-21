"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  Clock,
  Eye,
  Globe,
  LogIn,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@buyease/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ActivityLogEntry = {
  id: string;
  type: "LOGIN" | "SETTINGS";
  email: string | null;
  ip: string;
  userAgent: string | null;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
  successful: boolean;
  failureReason: string | null;
  createdAt: string;
  adminUserRole: string | null;
  action: string | null;
  category: string | null;
  description: string | null;
  status: "SUCCESS" | "FAILED" | null;
};

export type ActivityStats = {
  totalEvents: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueIps: number;
  settingsChanges: number;
};

type TabId = "all" | "login" | "failed" | "settings" | "security";
type StatusFilter = "all" | "success" | "failed";
type TimeRange = "all" | "1h" | "24h" | "7d" | "30d";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All events", icon: Activity },
  { id: "login", label: "Successful logins", icon: LogIn },
  { id: "failed", label: "Failed attempts", icon: XCircle },
  { id: "settings", label: "Settings changes", icon: Settings },
  { id: "security", label: "Security events", icon: Shield },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const TIME_OPTIONS: { value: TimeRange; label: string; ms: number }[] = [
  { value: "1h", label: "Last hour", ms: 3_600_000 },
  { value: "24h", label: "Last 24 hours", ms: 86_400_000 },
  { value: "7d", label: "Last 7 days", ms: 604_800_000 },
  { value: "30d", label: "Last 30 days", ms: 2_592_000_000 },
  { value: "all", label: "All time", ms: 0 },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(iso: string): string {
  const m = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDateTime(iso);
}

function buildLocation(log: ActivityLogEntry): string {
  return (
    [log.locationCity, log.locationRegion, log.locationCountry]
      .filter(Boolean)
      .join(", ") || "Unknown"
  );
}

function filterByTab(logs: ActivityLogEntry[], tab: TabId): ActivityLogEntry[] {
  switch (tab) {
    case "login":
      return logs.filter((l) => l.type === "LOGIN" && l.successful);
    case "failed":
      return logs.filter((l) => !l.successful);
    case "settings":
      return logs.filter((l) => l.type === "SETTINGS");
    case "security":
      return logs.filter(
        (l) => l.type === "SETTINGS" && l.category?.toUpperCase() === "SECURITY"
      );
    default:
      return logs;
  }
}

export function ActivityLogClient({
  logs,
  stats,
}: {
  logs: ActivityLogEntry[];
  stats: ActivityStats;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const tabFilteredLogs = useMemo(() => filterByTab(logs, activeTab), [logs, activeTab]);

  const filteredLogs = useMemo(() => {
    let result = tabFilteredLogs;

    if (statusFilter !== "all") {
      result = result.filter((l) =>
        statusFilter === "success" ? l.successful : !l.successful
      );
    }

    if (timeRange !== "all") {
      const option = TIME_OPTIONS.find((o) => o.value === timeRange);
      if (option && option.ms > 0) {
        const cutoff = Date.now() - option.ms;
        result = result.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.email?.toLowerCase().includes(q) ||
          l.ip.toLowerCase().includes(q) ||
          l.userAgent?.toLowerCase().includes(q) ||
          buildLocation(l).toLowerCase().includes(q)
      );
    }

    return result;
  }, [tabFilteredLogs, statusFilter, timeRange, search]);

  const tabStats: Record<TabId, number> = useMemo(
    () => ({
      all: logs.length,
      login: stats.successfulLogins,
      failed: stats.failedLogins,
      settings: stats.settingsChanges,
      security: logs.filter(
        (l) => l.type === "SETTINGS" && l.category?.toUpperCase() === "SECURITY"
      ).length,
    }),
    [logs, stats]
  );

  const hasActiveFilters = statusFilter !== "all" || timeRange !== "all" || search.length > 0;

  const clearAllFilters = () => {
    setStatusFilter("all");
    setTimeRange("all");
    setSearch("");
  };

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All statuses";
  const timeLabel = TIME_OPTIONS.find((o) => o.value === timeRange)?.label ?? "All time";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recent activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor admin authentication and settings events in one timeline.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatCard label="Total events" value={stats.totalEvents} icon={Activity} />
        <StatCard
          label="Successful logins"
          value={stats.successfulLogins}
          icon={Check}
          accent="text-emerald-400"
        />
        <StatCard
          label="Failed attempts"
          value={stats.failedLogins}
          icon={ShieldAlert}
          accent="text-rose-400"
        />
        <StatCard label="Unique IPs" value={stats.uniqueIps} icon={Globe} />
        <StatCard label="Settings changes" value={stats.settingsChanges} icon={Settings} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 border-b border-border pb-3 lg:w-[200px] lg:border-b-0 lg:border-r lg:border-sidebar-border/60 lg:pb-0 lg:pr-4">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                    active
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={cn(
                      "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      active
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tabStats[tab.id]}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email, IP, location, or device..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-8 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs",
                      statusFilter !== "all" && "border-primary/40 text-foreground"
                    )}
                  />
                }
              >
                Status: {statusLabel}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs",
                      timeRange !== "all" && "border-primary/40 text-foreground"
                    )}
                  />
                }
              >
                <Clock className="size-3" />
                {timeLabel}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Filter by time</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={timeRange}
                  onValueChange={(v) => setTimeRange(v as TimeRange)}
                >
                  {TIME_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilter !== "all" && (
                <FilterChip
                  label={`Status: ${statusLabel}`}
                  onClear={() => setStatusFilter("all")}
                />
              )}
              {timeRange !== "all" && (
                <FilterChip
                  label={timeLabel}
                  onClear={() => setTimeRange("all")}
                />
              )}
              {search && (
                <FilterChip
                  label={`"${search}"`}
                  onClear={() => setSearch("")}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Activity className="mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No events found</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query."
                  : "No activity recorded for this category yet."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={clearAllFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="max-h-[calc(100svh-420px)] space-y-1.5 overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <LogRow key={log.id} log={log} onView={() => setSelectedLog(log)} />
              ))}
            </div>
          )}

          {filteredLogs.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {tabFilteredLogs.length} events
            </p>
          )}
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="max-w-[560px] p-0 sm:max-w-[600px]">
            <div className="p-6">
              <DialogHeader className="mb-6 space-y-1.5">
                <DialogTitle className="text-xl font-semibold">Event details</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Full audit context for this activity event.
                </p>
              </DialogHeader>

              <div className="mb-5 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/15 p-1.5 text-primary">
                    <Activity className="size-4" />
                  </div>
                  <span className="text-sm font-medium">{selectedLog.type} event</span>
                </div>
                <Badge variant={selectedLog.successful ? "success" : "destructive"}>
                  {selectedLog.successful ? "Success" : "Failed"}
                </Badge>
              </div>

              <div className="space-y-3">
                <DetailRow label="Event ID" value={selectedLog.id} mono />
                <DetailRow label="Type" value={selectedLog.type} />
                <DetailRow label="Email" value={selectedLog.email ?? "N/A"} />
                {selectedLog.type === "SETTINGS" ? (
                  <>
                    <DetailRow label="Action" value={selectedLog.action ?? "N/A"} mono />
                    <DetailRow label="Category" value={selectedLog.category ?? "N/A"} />
                    <DetailRow
                      label="Description"
                      value={selectedLog.description ?? "No description"}
                    />
                  </>
                ) : (
                  <>
                    <DetailRow label="IP address" value={selectedLog.ip} mono />
                    <DetailRow label="Location" value={buildLocation(selectedLog)} />
                    <DetailRow
                      label="User agent"
                      value={selectedLog.userAgent ?? "Unknown"}
                      mono
                      small
                    />
                  </>
                )}
                {selectedLog.adminUserRole && (
                  <DetailRow label="Role" value={selectedLog.adminUserRole} />
                )}
                {selectedLog.failureReason && (
                  <DetailRow
                    label="Failure reason"
                    value={selectedLog.failureReason}
                    accent="text-rose-400"
                  />
                )}
                <DetailRow label="Timestamp" value={formatDateTime(selectedLog.createdAt)} mono />
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-2">
              <DialogClose render={<Button variant="ghost" />}>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
      {label}
      <button onClick={onClear} className="ml-0.5 text-muted-foreground hover:text-foreground">
        <X className="size-3" />
      </button>
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <Card className="min-w-[210px] shrink-0 flex-1 border-border bg-card shadow-none">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className={cn("rounded-md border border-border bg-muted/40 p-1.5", accent)}>
            <Icon className="size-3.5" />
          </div>
        </div>
        <p className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function LogRow({ log, onView }: { log: ActivityLogEntry; onView: () => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3.5 py-3 transition-colors hover:bg-muted/30">
      <div
        className={cn(
          "size-2 shrink-0 rounded-full",
          log.successful ? "bg-emerald-400" : "bg-rose-400"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {log.description ?? log.email ?? "Unknown"}
          </p>
          <Badge variant={log.successful ? "success" : "destructive"}>
            {log.type === "SETTINGS"
              ? `${log.status ?? "SUCCESS"}`
              : log.successful
                ? "Success"
                : "Failed"}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {log.type === "LOGIN" ? (
            <span className="flex items-center gap-1">
              <Globe className="size-3" />
              {log.ip}
            </span>
          ) : (
            <span>{log.category ?? "SETTINGS"}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeTime(log.createdAt)}
          </span>
          <span className="truncate">
            {log.type === "LOGIN" ? buildLocation(log) : log.email ?? "Unknown admin"}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onView}
      >
        <Eye className="size-3.5" />
      </Button>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  small,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "break-all text-sm text-foreground",
          mono && "font-mono",
          small && "text-xs",
          accent
        )}
      >
        {value}
      </span>
    </div>
  );
}
