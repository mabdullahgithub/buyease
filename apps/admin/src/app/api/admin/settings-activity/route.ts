import { db } from "@buyease/db";
import { requireAdminSession } from "@/lib/admin-session";

const SETTINGS_ACTIVITY_PREFIX = "SETTINGS_EVENT";

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();

    const body = (await request.json()) as {
      action: string;
      category: string;
      description: string;
      metadata?: Record<string, unknown>;
      status?: "SUCCESS" | "FAILED";
    };

    if (!body.action || !body.category || !body.description) {
      return Response.json(
        { error: "Missing required fields: action, category, description" },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "0.0.0.0";
    const encodedUserAgent = `${SETTINGS_ACTIVITY_PREFIX}:${body.category}:${body.action}`;

    const activity = await db.adminLoginActivity.create({
      data: {
        adminUserId: session.user.id,
        email: session.user.email,
        ip,
        userAgent: encodedUserAgent,
        successful: (body.status || "SUCCESS") === "SUCCESS",
        failureReason: body.description,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return Response.json({
      ok: true,
      activity,
    });
  } catch (error) {
    console.error("Failed to log settings activity:", error);
    return Response.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
