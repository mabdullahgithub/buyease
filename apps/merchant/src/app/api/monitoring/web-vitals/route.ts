import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@buyease/db";
import { authenticateEmbeddedRequest } from "@/lib/embedded-auth";

const webVitalSchema = z.object({
  name: z.enum(["LCP", "CLS", "INP"]),
  value: z.number().finite().nonnegative(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  id: z.string().min(1).max(128),
  path: z.string().min(1).max(512),
  navigationType: z.string().min(1).max(64).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authenticated = await authenticateEmbeddedRequest(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    const parsed = webVitalSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    const payload = parsed.data;

    await db.webVitalMetric.create({
      data: {
        shop: authenticated.shop,
        name: payload.name,
        value: payload.value,
        rating: payload.rating,
        path: payload.path,
        metricId: payload.id,
        navigationType: payload.navigationType,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error("[api/monitoring/web-vitals]", error);
    return NextResponse.json({ error: "Unable to ingest web vitals" }, { status: 500 });
  }
}
