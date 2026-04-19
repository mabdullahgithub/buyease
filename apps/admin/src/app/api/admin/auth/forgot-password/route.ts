import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@buyease/db";
import { rateLimit } from "@/lib/rate-limit-memory";
import { generateResetToken, hashResetToken } from "@/lib/token-hash";
import { sendAdminPasswordResetEmail } from "@/lib/send-password-reset-email";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

const RESET_TTL_MS = 60 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1"
  );
}

function publicResponse(): NextResponse {
  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for this email, you will receive reset instructions shortly.",
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const ipLimit = rateLimit(`forgot:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const emailLimit = rateLimit(`forgot:email:${email}`, 5, 60 * 60 * 1000);
  if (!emailLimit.ok) {
    return publicResponse();
  }

  const admin = await db.adminUser.findFirst({
    where: { email, isActive: true },
    select: { email: true },
  });

  if (!admin) {
    return publicResponse();
  }

  const hasEmail =
    Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.RESEND_FROM_EMAIL);

  if (!hasEmail) {
    return publicResponse();
  }

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await db.adminPasswordResetToken.deleteMany({
    where: { email, usedAt: null },
  });

  await db.adminPasswordResetToken.create({
    data: { email, tokenHash, expiresAt },
  });

  const baseUrl =
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "";

  if (!baseUrl) {
    await db.adminPasswordResetToken.deleteMany({ where: { email, tokenHash } });
    return NextResponse.json(
      { ok: false, error: "Server misconfiguration: AUTH_URL or NEXTAUTH_URL is missing." },
      { status: 500 }
    );
  }

  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  const sent = await sendAdminPasswordResetEmail(admin.email, resetUrl);

  if (!sent.ok) {
    await db.adminPasswordResetToken.deleteMany({ where: { email, tokenHash } });
    return NextResponse.json(
      { ok: false, error: "Could not send reset email. Try again later." },
      { status: 502 }
    );
  }

  return publicResponse();
}
