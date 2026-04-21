import { getShopify } from "@/lib/shopify";
import { validateShopDomain } from "@/lib/auth";

type SessionTokenClaims = {
  dest?: string;
  aud?: string;
  iss?: string;
  sub?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  sid?: string;
};

function extractBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function getShopFromDest(dest: string | undefined): string | null {
  if (!dest) {
    return null;
  }

  const normalized = validateShopDomain(dest.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  return normalized;
}

/**
 * Verifies Shopify embedded session token from Authorization header.
 */
export async function authenticateEmbeddedRequest(
  request: Request
): Promise<{ shop: string; claims: SessionTokenClaims } | null> {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  const claims = (await getShopify().session.decodeSessionToken(token)) as SessionTokenClaims;
  const shop = getShopFromDest(claims.dest);
  if (!shop) {
    return null;
  }

  return { shop, claims };
}
