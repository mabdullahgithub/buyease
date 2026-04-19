import { createHash, randomBytes } from "crypto";

/**
 * Generates a URL-safe random token for password reset links.
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * SHA-256 hex digest used for storing reset tokens (never store the raw token).
 */
export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
