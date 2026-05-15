// Refactored to use Web Crypto API (global crypto) for Edge Runtime compatibility

const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_SECRET_BYTES = 20;
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_GROUP_LENGTH = 4;
const TRUSTED_DEVICE_COOKIE_NAME = "buyease_admin_trusted_device";
const TRUSTED_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 15;

async function getAuthSecretKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret?.trim()) {
    throw new Error("AUTH_SECRET is required for admin 2FA encryption.");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return await crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
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

async function createHotp(secret: string, counter: number): Promise<string> {
  const keyData = decodeBase32(secret);
  const counterBuffer = new ArrayBuffer(8);
  const view = new DataView(counterBuffer);
  view.setBigUint64(0, BigInt(counter), false);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(keyData),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBuffer);
  const hmac = new Uint8Array(signature);

  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);

  const mod = 10 ** TOTP_DIGITS;
  return String(code % mod).padStart(TOTP_DIGITS, "0");
}

function getCounter(timestampMs: number): number {
  return Math.floor(timestampMs / 1000 / TOTP_PERIOD_SECONDS);
}

async function generateHumanCode(totalGroups = 4): Promise<string> {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = (): string => {
    const bytes = crypto.getRandomValues(new Uint8Array(RECOVERY_CODE_GROUP_LENGTH));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]!).join("");
  };

  return Array.from({ length: totalGroups }, () => group()).join("-");
}

/**
 * Generates a new base32 TOTP secret for an admin account.
 */
export function generateTwoFactorSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOTP_SECRET_BYTES));
  return encodeBase32(Buffer.from(bytes));
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
export async function encryptTwoFactorSecret(secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getAuthSecretKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const buffer = new Uint8Array(encrypted);
  const ciphertext = buffer.slice(0, buffer.length - 16);
  const tag = buffer.slice(buffer.length - 16);

  return [
    Buffer.from(iv).toString("base64url"),
    Buffer.from(ciphertext).toString("base64url"),
    Buffer.from(tag).toString("base64url")
  ].join(".");
}

/**
 * Decrypts an encrypted TOTP secret from the database.
 */
export async function decryptTwoFactorSecret(encryptedSecret: string): Promise<string> {
  const [ivPart, ciphertextPart, tagPart] = encryptedSecret.split(".");
  if (!ivPart || !ciphertextPart || !tagPart) {
    throw new Error("Invalid encrypted 2FA secret.");
  }

  const iv = Buffer.from(ivPart, "base64url");
  const ciphertext = Buffer.from(ciphertextPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");
  const key = await getAuthSecretKey();

  const data = new Uint8Array(ciphertext.length + tag.length);
  data.set(ciphertext);
  data.set(tag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Verifies a TOTP code against the provided secret.
 */
export async function verifyTwoFactorCode(secret: string, code: string, window = 1): Promise<boolean> {
  const normalizedCode = normalizeTwoFactorCode(code);
  if (!/^\d{6}$/.test(normalizedCode)) return false;

  const counter = getCounter(Date.now());
  for (let offset = -window; offset <= window; offset += 1) {
    const expected = await createHotp(secret, counter + offset);
    if (expected === normalizedCode) return true;
  }

  return false;
}

/**
 * Generates human-readable recovery codes for a 2FA-enabled account.
 */
export async function generateTwoFactorRecoveryCodes(total = RECOVERY_CODE_COUNT): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < total; i++) {
    codes.push(await generateHumanCode());
  }
  return codes;
}

/**
 * Hashes a recovery code before storing it in the database.
 */
export async function hashTwoFactorRecoveryCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizeTwoFactorCode(code));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

/**
 * Generates a random trusted-device token for the 15-day remember-device flow.
 */
export function generateTrustedDeviceToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Hashes a trusted-device token before persisting it in the database.
 */
export async function hashTrustedDeviceToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
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
