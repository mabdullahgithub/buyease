import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@buyease/db";
import { getClientIpFromHeaders, getEnvAllowlistIps, getEnvBlockedIps, parseLocationFromHeaders } from "@/lib/admin-network";
import {
  decryptTwoFactorSecret,
  getTrustedDeviceCookieName,
  hashTwoFactorRecoveryCode,
  hashTrustedDeviceToken,
  verifyTwoFactorCode,
} from "@/lib/admin-two-factor";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_WINDOW_MS = 15 * 60 * 1000;
const loginFailures = new Map<string, { count: number; firstFailureAt: number }>();

class TwoFactorRequiredError extends CredentialsSignin {
  code = "TWO_FACTOR_REQUIRED";
}

class TwoFactorInvalidCodeError extends CredentialsSignin {
  code = "INVALID_TWO_FACTOR_CODE";
}

function getAttemptKey(email: string, ip: string): string {
  return `${email}::${ip}`;
}

function isLocked(attemptKey: string): boolean {
  const state = loginFailures.get(attemptKey);
  if (!state) return false;
  const elapsed = Date.now() - state.firstFailureAt;
  if (elapsed >= LOGIN_LOCK_WINDOW_MS) {
    loginFailures.delete(attemptKey);
    return false;
  }
  return state.count >= LOGIN_MAX_ATTEMPTS;
}

function registerFailure(attemptKey: string): void {
  const now = Date.now();
  const current = loginFailures.get(attemptKey);
  if (!current || now - current.firstFailureAt >= LOGIN_LOCK_WINDOW_MS) {
    loginFailures.set(attemptKey, { count: 1, firstFailureAt: now });
    return;
  }
  loginFailures.set(attemptKey, { count: current.count + 1, firstFailureAt: current.firstFailureAt });
}

function clearFailures(attemptKey: string): void {
  loginFailures.delete(attemptKey);
}

function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName !== cookieName) continue;
    return rawValue.join("=") || null;
  }

  return null;
}

async function isIpAllowlisted(ip: string, db: typeof import("@buyease/db").db): Promise<boolean> {
  const envBlocked = getEnvBlockedIps();
  if (ip && envBlocked.has(ip)) return false;

  try {
    const dbBlocked = await db.adminIpBlocklist?.findFirst({
      where: { ip, isActive: true },
      select: { id: true },
    });
    if (dbBlocked) return false;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")) {
      throw error;
    }
  }

  const envIps = getEnvAllowlistIps();
  if (envIps.has(ip)) return true;

  let dbIp: { id: string } | null = null;
  try {
    dbIp = await db.adminIpAllowlist?.findFirst({
      where: { ip, isActive: true },
      select: { id: true },
    }) ?? null;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")) {
      throw error;
    }
  }

  if (dbIp) return true;
  return envIps.size === 0;
}

async function logLoginActivity(params: {
  db: typeof import("@buyease/db").db;
  adminUserId?: string;
  email?: string;
  ip: string;
  userAgent: string | null;
  successful: boolean;
  failureReason?: string;
  request: Request;
}): Promise<void> {
  const location = parseLocationFromHeaders(params.request.headers);
  try {
    await params.db.adminLoginActivity?.create({
      data: {
        adminUserId: params.adminUserId,
        email: params.email,
        ip: params.ip || "unknown",
        userAgent: params.userAgent,
        locationCity: location.city,
        locationRegion: location.region,
        locationCountry: location.country,
        successful: params.successful,
        failureReason: params.failureReason,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return;
    }
    // Non-blocking: auth should not fail solely due to analytics logging.
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(500),
  twoFactorCode: z.string().min(1).max(128).optional(),
  rememberDevice: z.string().optional(),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { db } = await import("@buyease/db");

        const { email, password } = parsed.data;
        const twoFactorCode = parsed.data.twoFactorCode?.trim() ?? "";
        const normalizedEmail = email.trim().toLowerCase();
        const ip = getClientIpFromHeaders(request.headers);
        const attemptKey = getAttemptKey(normalizedEmail, ip);
        const userAgent = request.headers.get("user-agent");

        if (isLocked(attemptKey)) {
          await logLoginActivity({
            db,
            email: normalizedEmail,
            ip,
            userAgent,
            successful: false,
            failureReason: "Too many attempts. Try again later.",
            request,
          });
          return null;
        }

        const admin = await db.adminUser.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            isActive: true,
            twoFactorEnabled: true,
            twoFactorSecretEncrypted: true,
          },
        });

        if (!admin || !admin.isActive) {
          registerFailure(attemptKey);
          await logLoginActivity({
            db,
            email: normalizedEmail,
            ip,
            userAgent,
            successful: false,
            failureReason: "Unknown or inactive admin account.",
            request,
          });
          return null;
        }

        const allowlisted = await isIpAllowlisted(ip, db);
        if (!allowlisted) {
          await logLoginActivity({
            db,
            adminUserId: admin.id,
            email: admin.email,
            ip,
            userAgent,
            successful: false,
            failureReason: "IP is not allowlisted.",
            request,
          });
          return null;
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
          registerFailure(attemptKey);
          await logLoginActivity({
            db,
            adminUserId: admin.id,
            email: admin.email,
            ip,
            userAgent,
            successful: false,
            failureReason: "Invalid password.",
            request,
          });
          return null;
        }

        if (admin.twoFactorEnabled) {
          const trustedDeviceToken = getCookieValue(request.headers.get("cookie"), getTrustedDeviceCookieName());
          let trustedDeviceAllowed = false;

          if (trustedDeviceToken) {
            const trustedDeviceHash = hashTrustedDeviceToken(trustedDeviceToken);
            const trustedDevice = await db.adminTrustedDevice.findUnique({
              where: { tokenHash: trustedDeviceHash },
              select: { adminUserId: true, expiresAt: true },
            });

            if (trustedDevice?.adminUserId === admin.id && trustedDevice.expiresAt > new Date()) {
              trustedDeviceAllowed = true;
              await db.adminTrustedDevice.update({
                where: { tokenHash: trustedDeviceHash },
                data: { lastUsedAt: new Date() },
              });
            } else if (trustedDevice?.expiresAt && trustedDevice.expiresAt <= new Date()) {
              await db.adminTrustedDevice.delete({
                where: { tokenHash: trustedDeviceHash },
              });
            }
          }

          if (!trustedDeviceAllowed) {
            if (!twoFactorCode) {
              await logLoginActivity({
                db,
                adminUserId: admin.id,
                email: admin.email,
                ip,
                userAgent,
                successful: false,
                failureReason: "Two-factor authentication required.",
                request,
              });
              throw new TwoFactorRequiredError();
            }

            if (!admin.twoFactorSecretEncrypted) {
              registerFailure(attemptKey);
              await logLoginActivity({
                db,
                adminUserId: admin.id,
                email: admin.email,
                ip,
                userAgent,
                successful: false,
                failureReason: "Two-factor secret is missing.",
                request,
              });
              return null;
            }

            const normalizedCode = twoFactorCode.replace(/[\s-]/g, "").toUpperCase();
            const decryptedSecret = decryptTwoFactorSecret(admin.twoFactorSecretEncrypted);
            const totpValid = verifyTwoFactorCode(decryptedSecret, normalizedCode);

            if (!totpValid) {
              const recoveryCode = await db.adminTwoFactorBackupCode.findUnique({
                where: { codeHash: hashTwoFactorRecoveryCode(normalizedCode) },
                select: { id: true, adminUserId: true, usedAt: true },
              });

              if (!recoveryCode || recoveryCode.adminUserId !== admin.id || recoveryCode.usedAt) {
                registerFailure(attemptKey);
                await logLoginActivity({
                  db,
                  adminUserId: admin.id,
                  email: admin.email,
                  ip,
                  userAgent,
                  successful: false,
                  failureReason: "Invalid two-factor code.",
                  request,
                });
                throw new TwoFactorInvalidCodeError();
              }

              await db.adminTwoFactorBackupCode.update({
                where: { id: recoveryCode.id },
                data: { usedAt: new Date() },
              });
            }
          }
        }

        clearFailures(attemptKey);

        await db.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        await logLoginActivity({
          db,
          adminUserId: admin.id,
          email: admin.email,
          ip,
          userAgent,
          successful: true,
          failureReason: undefined,
          request,
        });

        return {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; email: string; role: string };
        token.role = u.role;
        token.email = u.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "";
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
});
