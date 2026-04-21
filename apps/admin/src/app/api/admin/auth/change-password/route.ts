import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@buyease/db";
import { requireAdminSession } from "@/lib/admin-session";
import { adminPasswordSchema } from "@/lib/password-policy";

const bodySchema = z.object({
  currentPassword: z.string().min(1).max(500),
  newPassword: adminPasswordSchema,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await requireAdminSession();
  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

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
      first.newPassword?.[0] ??
      first.currentPassword?.[0] ??
      "Invalid request.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const admin = await db.adminUser.findFirst({
    where: { email, isActive: true },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const currentOk = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!currentOk) {
    return NextResponse.json(
      { ok: false, error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  const same = await bcrypt.compare(newPassword, admin.passwordHash);
  if (same) {
    return NextResponse.json(
      { ok: false, error: "New password must be different from the current password." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  await db.adminPasswordResetToken.deleteMany({
    where: { email, usedAt: null },
  });

  return NextResponse.json({ ok: true, message: "Password updated successfully." });
}
