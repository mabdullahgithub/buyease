import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@buyease/db";
import { isValidAdminRole } from "@/lib/admin-access";
import { isCurrentRequestIpAllowed } from "@/lib/admin-ip-guard";
import { auth } from "@/lib/auth";
import {
  buildTwoFactorOtpAuthUri,
  encryptTwoFactorSecret,
  formatTwoFactorSecret,
  generateTwoFactorRecoveryCodes,
  generateTwoFactorSecret,
  hashTwoFactorRecoveryCode,
  verifyTwoFactorCode,
} from "@/lib/admin-two-factor";

const enableSchema = z.object({
  secret: z.string().min(1).max(128),
  verificationCode: z.string().min(1).max(128),
});

const disableSchema = z.object({
  currentPassword: z.string().min(1).max(500),
});

function buildLoginUri(email: string, secret: string): string {
  return buildTwoFactorOtpAuthUri({
    issuer: "BuyEase",
    accountName: email,
    secret,
  });
}

async function getAdminBySessionEmail(email: string): Promise<{
  id: string;
  email: string;
  passwordHash: string;
  twoFactorEnabled: boolean;
  twoFactorSecretEncrypted: string | null;
} | null> {
  return db.adminUser.findFirst({
    where: { email, isActive: true },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      twoFactorEnabled: true,
      twoFactorSecretEncrypted: true,
    },
  });
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email || !isValidAdminRole(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    if (!(await isCurrentRequestIpAllowed())) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const admin = await getAdminBySessionEmail(session.user.email);
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (admin.twoFactorEnabled) {
      return NextResponse.json(
        { ok: false, error: "Two-factor authentication is already enabled." },
        { status: 409 }
      );
    }

    const secret = formatTwoFactorSecret(generateTwoFactorSecret());
    return NextResponse.json({
      ok: true,
      secret,
      otpauthUri: buildLoginUri(admin.email, secret),
    });
  } catch (error) {
    process.stderr.write(
      `[admin two-factor GET] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json({ ok: false, error: "Unable to prepare two-factor setup." }, { status: 500 });
  }
}

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

    const parsed = enableSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Enter a valid 2FA code." }, { status: 400 });
    }

    const admin = await getAdminBySessionEmail(session.user.email);
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (admin.twoFactorEnabled) {
      return NextResponse.json(
        { ok: false, error: "Two-factor authentication is already enabled." },
        { status: 409 }
      );
    }

    const { secret, verificationCode } = parsed.data;
    if (!verifyTwoFactorCode(secret, verificationCode)) {
      return NextResponse.json(
        { ok: false, error: "The verification code is not valid." },
        { status: 400 }
      );
    }

    const recoveryCodes = generateTwoFactorRecoveryCodes();
    const encryptedSecret = encryptTwoFactorSecret(secret);

    await db.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: admin.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecretEncrypted: encryptedSecret,
          twoFactorEnabledAt: new Date(),
        },
      });

      await tx.adminTwoFactorBackupCode.deleteMany({
        where: { adminUserId: admin.id },
      });
      await tx.adminTrustedDevice.deleteMany({
        where: { adminUserId: admin.id },
      });

      await tx.adminTwoFactorBackupCode.createMany({
        data: recoveryCodes.map((code) => ({
          adminUserId: admin.id,
          codeHash: hashTwoFactorRecoveryCode(code),
        })),
      });
    });

    return NextResponse.json({ ok: true, recoveryCodes });
  } catch (error) {
    process.stderr.write(
      `[admin two-factor POST] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json({ ok: false, error: "Unable to enable two-factor authentication." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    const parsed = disableSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Enter your password to disable 2FA." }, { status: 400 });
    }

    const admin = await getAdminBySessionEmail(session.user.email);
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const passwordOk = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: admin.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecretEncrypted: null,
          twoFactorEnabledAt: null,
        },
      });

      await tx.adminTwoFactorBackupCode.deleteMany({
        where: { adminUserId: admin.id },
      });
      await tx.adminTrustedDevice.deleteMany({
        where: { adminUserId: admin.id },
      });
    });

    const response = NextResponse.json({ ok: true, message: "Two-factor authentication disabled." });
    response.cookies.set({
      name: "buyease_admin_trusted_device",
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    process.stderr.write(
      `[admin two-factor DELETE] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json({ ok: false, error: "Unable to disable two-factor authentication." }, { status: 500 });
  }
}
