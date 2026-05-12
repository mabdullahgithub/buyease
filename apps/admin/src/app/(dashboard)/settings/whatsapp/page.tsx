import { revalidatePath } from "next/cache";
import { MessageCircle, Users, TrendingUp } from "lucide-react";
import { db } from "@buyease/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/admin-session";
import { WhatsAppGlobalForm } from "./whatsapp-form";
import { WhatsAppSubNav } from "./whatsapp-sub-nav";

/** Upsert-safe getter — creates the singleton row if it doesn't exist yet. */
async function getWhatsAppGlobalConfig() {
  const existing = await db.whatsAppGlobalConfig.findUnique({
    where: { id: 1 },
  });
  if (existing) return existing;

  return db.whatsAppGlobalConfig.create({
    data: {
      id: 1,
      provider: "TWILIO",
      pricePerMessage: 5,
      isEnabled: false,
    },
  });
}

async function saveWhatsAppConfig(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  "use server";

  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Insufficient permissions." };
  }

  const provider = String(formData.get("provider") ?? "TWILIO").trim();
  if (provider !== "TWILIO" && provider !== "WHATSAPP_BUSINESS") {
    return { success: false, error: "Invalid provider." };
  }

  const accountSid = String(formData.get("accountSid") ?? "").trim() || null;
  const authToken = String(formData.get("authToken") ?? "").trim() || null;
  const senderNumber =
    String(formData.get("senderNumber") ?? "").trim() || null;
  const wabaId = String(formData.get("wabaId") ?? "").trim() || null;
  const isEnabled = formData.get("isEnabled") === "on";
  const priceRaw = parseFloat(
    String(formData.get("pricePerMessage") ?? "5"),
  );
  const pricePerMessage = isNaN(priceRaw) || priceRaw < 0 ? 5 : priceRaw;

  await db.whatsAppGlobalConfig.upsert({
    where: { id: 1 },
    update: {
      provider,
      accountSid,
      authToken,
      senderNumber,
      wabaId,
      isEnabled,
      pricePerMessage,
    },
    create: {
      id: 1,
      provider,
      accountSid,
      authToken,
      senderNumber,
      wabaId,
      isEnabled,
      pricePerMessage,
    },
  });

  revalidatePath("/settings/whatsapp");
  return { success: true };
}

export default async function WhatsAppSettingsPage() {
  await requireAdminSession();

  const [config, merchantCount, messageStats] = await Promise.all([
    getWhatsAppGlobalConfig(),
    db.merchantWhatsAppConfig.count({ where: { isEnabled: true } }),
    db.whatsAppMessage.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const totalMessages = messageStats.reduce((sum, s) => sum + s._count.id, 0);
  const sentMessages =
    messageStats.find((s) => s.status === "SENT")?._count.id ?? 0;
  const failedMessages =
    messageStats.find((s) => s.status === "FAILED")?._count.id ?? 0;

  const totalRevenueCents = await db.whatsAppMessage
    .aggregate({ _sum: { costCents: true }, where: { status: "SENT" } })
    .then((r) => r._sum.costCents ?? 0);

  return (
    <div className="space-y-8">
      <WhatsAppSubNav />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          WhatsApp messaging
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the shared Twilio integration and per-message pricing.
          Merchants activate the feature from their dashboard and are charged
          from their credit balance on every send.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
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
              with WhatsApp enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MessageCircle className="size-4" />
              Messages sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sentMessages}</p>
            <p className="text-xs text-muted-foreground">
              {failedMessages} failed · {totalMessages} total
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
              ${(totalRevenueCents / 100).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              from successful messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Config form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            Provider configuration
          </CardTitle>
          <CardDescription>
            These credentials are shared across all merchant stores. Auth tokens
            are stored encrypted and never returned to the merchant app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppGlobalForm
            config={{
              provider: config.provider,
              accountSid: config.accountSid,
              authToken: config.authToken,
              senderNumber: config.senderNumber,
              wabaId: config.wabaId,
              pricePerMessage: config.pricePerMessage.toNumber(),
              isEnabled: config.isEnabled,
            }}
            saveAction={saveWhatsAppConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}
