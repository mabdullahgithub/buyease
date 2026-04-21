import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * `/` has no UI; send users to the dashboard or sign-in.
 */
export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
