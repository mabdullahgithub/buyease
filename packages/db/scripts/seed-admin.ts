/**
 * Seeds or updates the initial super-admin user.
 *
 * Required env (in packages/db/.env or exported in shell):
 *   DATABASE_URL
 *   ADMIN_SEED_EMAIL
 *   ADMIN_SEED_PASSWORD  — min 12 chars, with upper, lower, and a digit
 *
 * Run: npm run seed:admin --workspace=@buyease/db
 * Or from repo root: npm run db:seed:admin
 */

import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Always load packages/db/.env (works even if cwd is repo root)
const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(pkgRoot, ".env") });

const prisma = new PrismaClient();

function validatePassword(password: string): string | null {
  if (password.length < 12) {
    return "ADMIN_SEED_PASSWORD must be at least 12 characters.";
  }
  if (!/[a-z]/.test(password)) {
    return "ADMIN_SEED_PASSWORD must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "ADMIN_SEED_PASSWORD must include an uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "ADMIN_SEED_PASSWORD must include a number.";
  }
  if (password.length > 128) {
    return "ADMIN_SEED_PASSWORD must be at most 128 characters.";
  }
  return null;
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "ADMIN_SEED_EMAIL must be a valid email address.";
  }
  return null;
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    process.stderr.write("DATABASE_URL is missing. Set it in packages/db/.env\n");
    process.exit(1);
  }

  const emailRaw = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!emailRaw?.trim()) {
    process.stderr.write(
      "ADMIN_SEED_EMAIL is missing. Set it in packages/db/.env (see .env.example).\n"
    );
    process.exit(1);
  }

  if (!password) {
    process.stderr.write(
      "ADMIN_SEED_PASSWORD is missing. Set it in packages/db/.env (see .env.example).\n"
    );
    process.exit(1);
  }

  const emailErr = validateEmail(emailRaw);
  if (emailErr) {
    process.stderr.write(`${emailErr}\n`);
    process.exit(1);
  }

  const pwdErr = validatePassword(password);
  if (pwdErr) {
    process.stderr.write(`${pwdErr}\n`);
    process.exit(1);
  }

  const email = emailRaw.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    select: { id: true, email: true, role: true },
  });

  process.stdout.write(
    `Super admin ready: ${user.email} (${user.role}, id=${user.id}).\n` +
      "You can sign in at the admin app /login route.\n"
  );
}

main()
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Seed failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
