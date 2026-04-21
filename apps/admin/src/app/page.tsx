import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * `/` has no UI; send users to the dashboard or sign-in.
 */
export default async function HomePage() {
  const session = await auth();
  redirect(session ? "/dashboard" : "/login");
}
