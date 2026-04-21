import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { isValidAdminRole } from "@/lib/admin-access";
import { auth } from "@/lib/auth";
import { assertCurrentRequestIpAllowed } from "@/lib/admin-ip-guard";

export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user?.email || !isValidAdminRole(session.user.role)) {
    redirect("/login");
  }
  await assertCurrentRequestIpAllowed();
  return session;
}
