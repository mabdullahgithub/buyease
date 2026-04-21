import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@buyease/db";
import { isValidAdminRole } from "@/lib/admin-access";
import { isCurrentRequestIpAllowed } from "@/lib/admin-ip-guard";
import { auth } from "@/lib/auth";
import {
  generateTrustedDeviceToken,
  getTrustedDeviceCookieName,
  getTrustedDeviceMaxAgeSeconds,
  hashTrustedDeviceToken,
} from "@/lib/admin-two-factor";

const bodySchema = z.object({
  rememberDevice: z.boolean().default(false),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email || !isValidAdminRole(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    if (!(await isCurrentRequestIpAllowed())) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success || !parsed.data.rememberDevice) {
      return NextResponse.json({ ok: true, remembered: false });
    }

    const admin = await db.adminUser.findFirst({
      where: { email: session.user.email, isActive: true },
      select: { id: true, twoFactorEnabled: true },
    });

    if (!admin || !admin.twoFactorEnabled) {
      return NextResponse.json({ ok: true, remembered: false });
    }

    const trustedDeviceToken = generateTrustedDeviceToken();
    const trustedDeviceHash = hashTrustedDeviceToken(trustedDeviceToken);
    const expiresAt = new Date(Date.now() + getTrustedDeviceMaxAgeSeconds() * 1000);

    await db.adminTrustedDevice.create({
      data: {
        adminUserId: admin.id,
        tokenHash: trustedDeviceHash,
        expiresAt,
        userAgent: request.headers.get("user-agent"),
      },
    });

    const response = NextResponse.json({ ok: true, remembered: true });
    response.cookies.set({
      name: getTrustedDeviceCookieName(),
      value: trustedDeviceToken,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: getTrustedDeviceMaxAgeSeconds(),
    });

    return response;
  } catch (error) {
    process.stderr.write(
      `[admin remember-device] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json({ ok: false, error: "Unable to remember this device." }, { status: 500 });
  }
}
