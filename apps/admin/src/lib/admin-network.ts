type HeaderReader = {
  get(name: string): string | null;
};

export function normalizeIp(ip: string | null | undefined): string {
  if (!ip) return "";
  return ip.trim().replace(/^::ffff:/, "");
}

export function parseIpCsv(raw: string | null | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((ip) => normalizeIp(ip))
      .filter(Boolean),
  );
}

export function getClientIpFromHeaders(headers: HeaderReader): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    return normalizeIp(first ?? "");
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp);

  return "";
}

export function parseLocationFromHeaders(headers: HeaderReader): {
  city: string | null;
  region: string | null;
  country: string | null;
} {
  return {
    city: headers.get("x-vercel-ip-city"),
    region: headers.get("x-vercel-ip-country-region"),
    country: headers.get("x-vercel-ip-country"),
  };
}

export function getEnvAllowlistIps(): Set<string> {
  return parseIpCsv(process.env.ADMIN_WHITELISTED_IPS ?? process.env.ADMIN_ALLOWED_IPS ?? "");
}

export function getEnvBlockedIps(): Set<string> {
  return parseIpCsv(process.env.ADMIN_BLOCKED_IPS ?? "");
}
