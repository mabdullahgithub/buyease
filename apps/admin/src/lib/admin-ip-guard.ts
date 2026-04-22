import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getClientIpFromHeaders } from "@/lib/admin-network";
import { isIpAllowedForAdminAccess } from "@/lib/admin-ip-policy";

export async function isCurrentRequestIpAllowed(): Promise<boolean> {
  const requestHeaders = await headers();
  const ip = getClientIpFromHeaders(requestHeaders);
  return isIpAllowedForAdminAccess(ip);
}

export async function assertCurrentRequestIpAllowed(): Promise<void> {
  const allowed = await isCurrentRequestIpAllowed();
  if (!allowed) {
    redirect("/login");
  }
}
