import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@buyease/db";
import { adminPasswordSchema } from "@/lib/password-policy";
import { hashResetToken } from "@/lib/token-hash";

const bodySchema = z.object({
  token: z.string().min(20).max(512),
  password: adminPasswordSchema,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.password?.[0] ??
      first.token?.[0] ??
      "Invalid request.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const { token: rawToken, password } = parsed.data;
  const tokenHash = hashResetToken(rawToken);

  const match = await db.adminPasswordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, email: true },
  });

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const admin = await db.adminUser.findFirst({
    where: { email: match.email, isActive: true },
    select: { id: true },
  });

  if (!admin) {
    await db.adminPasswordResetToken.update({
      where: { id: match.id },
      data: { usedAt: new Date() },
    });
    return NextResponse.json(
      { ok: false, error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    }),
    db.adminPasswordResetToken.update({
      where: { id: match.id },
      data: { usedAt: new Date() },
    }),
    db.adminPasswordResetToken.deleteMany({
      where: { email: match.email, usedAt: null, id: { not: match.id } },
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
}
