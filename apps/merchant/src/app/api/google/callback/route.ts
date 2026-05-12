import { NextRequest, NextResponse } from "next/server";

import { db } from "@buyease/db";

import { encryptToken, exchangeCodeForTokens, parseOAuthState } from "@/lib/google-oauth";

// Called by Google after the user grants consent. No Shopify session here —
// shop identity comes from the signed `state` parameter.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return htmlResponse(false, `Google denied access: ${error}`);
  }

  if (!code || !state) {
    return htmlResponse(false, "Missing code or state parameter.");
  }

  const parsed = parseOAuthState(state);
  if (!parsed) {
    return htmlResponse(false, "Invalid or expired state parameter.");
  }

  const { shop } = parsed;

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return htmlResponse(false, `Token exchange failed: ${msg}`);
  }

  if (!tokens.refreshToken) {
    return htmlResponse(
      false,
      "Google did not return a refresh token. Please revoke access at myaccount.google.com/permissions and try again.",
    );
  }

  await db.googleSheetsIntegration.upsert({
    where: { shop },
    create: {
      shop,
      googleAccessToken: encryptToken(tokens.accessToken),
      googleRefreshToken: encryptToken(tokens.refreshToken),
      googleTokenExpiresAt: tokens.expiresAt,
      googleEmail: tokens.email,
      isEnabled: false,
      headerRowWritten: false,
    },
    update: {
      googleAccessToken: encryptToken(tokens.accessToken),
      googleRefreshToken: encryptToken(tokens.refreshToken),
      googleTokenExpiresAt: tokens.expiresAt,
      googleEmail: tokens.email,
      // Reset header flag when reconnecting so we re-verify the sheet
      headerRowWritten: false,
    },
  });

  return htmlResponse(true, "Connected successfully!");
}

function htmlResponse(success: boolean, message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${success ? "Connected" : "Error"} – BuyEase Google Sheets</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f6f6f7; }
    .card { background: #fff; border-radius: 12px; padding: 40px 48px;
            box-shadow: 0 2px 12px rgba(0,0,0,.10); text-align: center; max-width: 420px; }
    h1 { font-size: 22px; margin: 0 0 12px; color: ${success ? "#1a8a1a" : "#cc0000"}; }
    p  { color: #616161; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
    button { background: #5c6ac4; color: #fff; border: none; border-radius: 6px;
             padding: 10px 24px; font-size: 15px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${success ? "✓ Connected!" : "✗ Connection failed"}</h1>
    <p>${message}</p>
    <button onclick="window.close()">Close this window</button>
  </div>
  <script>
    if (${success ? "true" : "false"} && window.opener) {
      window.opener.postMessage({ type: 'BUYEASE_GOOGLE_CONNECTED', success: true }, '*');
    }
    // Auto-close after 3 s if opener handled the message
    setTimeout(() => { try { window.close(); } catch (_) {} }, 3000);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
