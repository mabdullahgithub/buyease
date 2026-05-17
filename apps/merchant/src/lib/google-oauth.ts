import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

const ENCRYPTION_KEY = (process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ?? "").trim();
const OAUTH_STATE_SECRET = (process.env.GOOGLE_OAUTH_STATE_SECRET ?? ENCRYPTION_KEY).trim();

export const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
export const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
export const GOOGLE_REDIRECT_URI = (process.env.GOOGLE_REDIRECT_URI ?? "").trim();

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "openid",
  "email",
];

// ---------------------------------------------------------------------------
// Token encryption (AES-256-CBC) — same pattern as admin 2FA secret
// ---------------------------------------------------------------------------

function derivedKey(): Buffer {
  if (ENCRYPTION_KEY.length < 32) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must be at least 32 characters. " +
      "Generate one with: openssl rand -hex 32",
    );
  }
  return Buffer.from(ENCRYPTION_KEY.slice(0, 32));
}

export function encryptToken(plaintext: string): string {
  const key = derivedKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(ciphertext: string): string {
  const [ivHex, encHex] = ciphertext.split(":");
  if (!ivHex || !encHex) throw new Error("Invalid ciphertext format");
  const key = derivedKey();
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// ---------------------------------------------------------------------------
// OAuth state — HMAC-signed to prevent CSRF, carries shop domain
// ---------------------------------------------------------------------------

export function buildOAuthState(shop: string): string {
  const payload = JSON.stringify({
    shop,
    ts: Date.now(),
    nonce: randomBytes(8).toString("hex"),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", OAUTH_STATE_SECRET).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

export function parseOAuthState(state: string): { shop: string } | null {
  const dotIdx = state.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const encoded = state.slice(0, dotIdx);
  const sig = state.slice(dotIdx + 1);
  const expected = createHmac("sha256", OAUTH_STATE_SECRET).update(encoded).digest("hex");
  if (sig !== expected) return null;

  let parsed: { shop: string; ts: number };
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      shop: string;
      ts: number;
    };
  } catch {
    return null;
  }

  // Reject states older than 10 minutes
  if (Date.now() - parsed.ts > 10 * 60 * 1000) return null;
  return { shop: parsed.shop };
}

// ---------------------------------------------------------------------------
// OAuth URL builder
// ---------------------------------------------------------------------------

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange and refresh
// ---------------------------------------------------------------------------

export type GoogleTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  email: string;
};

type RawTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
};

function emailFromIdToken(idToken: string): string {
  const parts = idToken.split(".");
  if (!parts[1]) return "";
  try {
    const claims = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { email?: string };
    return claims.email ?? "";
  } catch {
    return "";
  }
}

async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "";
  const user = (await res.json()) as { email?: string };
  return user.email ?? "";
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as RawTokenResponse;
  const email =
    data.id_token ? emailFromIdToken(data.id_token) : await fetchGoogleEmail(data.access_token);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    email,
  };
}

export async function refreshAccessToken(
  encryptedRefreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const refreshToken = decryptToken(encryptedRefreshToken);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export type SpreadsheetItem = { id: string; name: string };

export async function listSpreadsheets(accessToken: string): Promise<SpreadsheetItem[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'");
  const fields = encodeURIComponent("files(id,name)");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime+desc&pageSize=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API error (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { files: SpreadsheetItem[] };
  return data.files ?? [];
}

// ---------------------------------------------------------------------------
// Get a valid (non-expired) access token, auto-refreshing if needed
// ---------------------------------------------------------------------------

export async function getValidAccessToken(shop: string): Promise<string> {
  const { db } = await import("@buyease/db");

  const integration = await db.googleSheetsIntegration.findUnique({
    where: { shop },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiresAt: true,
    },
  });

  if (!integration?.googleAccessToken || !integration?.googleRefreshToken) {
    throw new Error("GOOGLE_NOT_CONNECTED");
  }

  const expiresAt = integration.googleTokenExpiresAt;
  const aboutToExpire = !expiresAt || expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

  if (aboutToExpire) {
    const refreshed = await refreshAccessToken(integration.googleRefreshToken);
    await db.googleSheetsIntegration.update({
      where: { shop },
      data: {
        googleAccessToken: encryptToken(refreshed.accessToken),
        googleTokenExpiresAt: refreshed.expiresAt,
      },
    });
    return refreshed.accessToken;
  }

  return decryptToken(integration.googleAccessToken);
}
