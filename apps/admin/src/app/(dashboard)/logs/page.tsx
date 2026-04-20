import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@buyease/ui";
import { formatDate } from "@buyease/utils";
import { AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

type LogEntry = {
  id: string;
  level: LogLevel;
  message: string;
  shop: string | null;
  timestamp: Date;
  meta: Record<string, unknown> | null;
};

const PLACEHOLDER_LOGS: LogEntry[] = [
  {
    id: "1",
    level: "INFO",
    message: "Webhook received: app/uninstalled",
    shop: "demo-store.myshopify.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    meta: null,
  },
  {
    id: "2",
    level: "WARN",
    message: "Session not found for shop during auth check",
    shop: "another-store.myshopify.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    meta: null,
  },
  {
    id: "3",
    level: "ERROR",
    message: "Failed to process order webhook: database timeout",
    shop: "busy-store.myshopify.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    meta: { retries: 3 },
  },
];

const LEVEL_CONFIG: Record<
  LogLevel,
  {
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline" | "warning";
  }
> = {
  INFO: { icon: Info, variant: "outline" },
  WARN: { icon: AlertCircle, variant: "warning" },
  ERROR: { icon: XCircle, variant: "destructive" },
  CRITICAL: { icon: XCircle, variant: "destructive" },
};

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Error and activity log stream
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {PLACEHOLDER_LOGS.map((log: LogEntry) => {
              const { icon: Icon, variant } = LEVEL_CONFIG[log.level];
              return (
                <div key={log.id} className="flex items-start gap-4 p-4">
                  <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={variant} className="text-xs">
                        {log.level}
                      </Badge>
                      {log.shop && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {log.shop}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(log.timestamp, "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{log.message}</p>
                    {log.meta && (
                      <pre className="text-xs text-muted-foreground mt-1 font-mono">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
