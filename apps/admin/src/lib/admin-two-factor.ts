import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_SECRET_BYTES = 20;
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_GROUP_LENGTH = 4;
const TRUSTED_DEVICE_COOKIE_NAME = "buyease_admin_trusted_device";
const TRUSTED_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 15;

function getAuthSecretKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret?.trim()) {
    throw new Error("AUTH_SECRET is required for admin 2FA encryption.");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

function normalizeSecret(secret: string): string {
  return secret.replace(/[-\s]/g, "").toUpperCase();
}

function normalizeTwoFactorCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

function encodeBase32(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31] ?? "A";
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31] ?? "A";
  }

  return output;
}

function decodeBase32(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = normalizeSecret(input);
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const character of cleaned) {
    const index = alphabet.indexOf(character);
    if (index < 0) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function createHotp(secret: string, counter: number): string {
  const key = decodeBase32(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const mod = 10 ** TOTP_DIGITS;
  return code % mod > 0 ? String(code % mod).padStart(TOTP_DIGITS, "0") : "000000";
}

function getCounter(timestampMs: number): number {
  return Math.floor(timestampMs / 1000 / TOTP_PERIOD_SECONDS);
}

function generateHumanCode(totalGroups = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = (): string =>
    Array.from({ length: RECOVERY_CODE_GROUP_LENGTH }, () => {
      const index = randomBytes(1)[0] ?? 0;
      return alphabet[index % alphabet.length] ?? "A";
    }).join("");

  return Array.from({ length: totalGroups }, () => group()).join("-");
}

/**
 * Generates a new base32 TOTP secret for an admin account.
 */
export function generateTwoFactorSecret(): string {
  return encodeBase32(randomBytes(TOTP_SECRET_BYTES));
}

/**
 * Formats a secret into grouped chunks for display in the UI.
 */
export function formatTwoFactorSecret(secret: string): string {
  const cleaned = normalizeSecret(secret);
  return cleaned.match(/.{1,4}/g)?.join("-") ?? cleaned;
}

/**
 * Builds the otpauth URI used by authenticator apps.
 */
export function buildTwoFactorOtpAuthUri(params: {
  issuer: string;
  accountName: string;
  secret: string;
}): string {
  const secret = normalizeSecret(params.secret);
  const label = `${params.issuer}:${params.accountName}`;
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(params.issuer)}`;
}

/**
 * Encrypts the TOTP secret before persisting it in the database.
 */
export function encryptTwoFactorSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getAuthSecretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), ciphertext.toString("base64url"), tag.toString("base64url")].join(".");
}

/**
 * Decrypts an encrypted TOTP secret from the database.
 */
export function decryptTwoFactorSecret(encryptedSecret: string): string {
  const [ivPart, ciphertextPart, tagPart] = encryptedSecret.split(".");
  if (!ivPart || !ciphertextPart || !tagPart) {
    throw new Error("Invalid encrypted 2FA secret.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getAuthSecretKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Verifies a TOTP code against the provided secret.
 */
export function verifyTwoFactorCode(secret: string, code: string, window = 1): boolean {
  const normalizedCode = normalizeTwoFactorCode(code);
  if (!/^\d{6}$/.test(normalizedCode)) return false;

  const counter = getCounter(Date.now());
  for (let offset = -window; offset <= window; offset += 1) {
    const expected = createHotp(secret, counter + offset);
    const expectedBuffer = Buffer.from(expected, "utf8");
    const providedBuffer = Buffer.from(normalizedCode, "utf8");

    if (expectedBuffer.length !== providedBuffer.length) continue;
    if (timingSafeEqual(expectedBuffer, providedBuffer)) return true;
  }

  return false;
}

/**
 * Generates human-readable recovery codes for a 2FA-enabled account.
 */
export function generateTwoFactorRecoveryCodes(total = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: total }, () => generateHumanCode());
}

/**
 * Hashes a recovery code before storing it in the database.
 */
export function hashTwoFactorRecoveryCode(code: string): string {
  return createHash("sha256").update(normalizeTwoFactorCode(code), "utf8").digest("hex");
}

/**
 * Generates a random trusted-device token for the 15-day remember-device flow.
 */
export function generateTrustedDeviceToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Hashes a trusted-device token before persisting it in the database.
 */
export function hashTrustedDeviceToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Returns the cookie name used to remember a trusted admin device.
 */
export function getTrustedDeviceCookieName(): string {
  return TRUSTED_DEVICE_COOKIE_NAME;
}

/**
 * Returns the max-age for a trusted admin device cookie in seconds.
 */
export function getTrustedDeviceMaxAgeSeconds(): number {
  return TRUSTED_DEVICE_MAX_AGE_SECONDS;
}
