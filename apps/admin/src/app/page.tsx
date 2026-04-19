import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * `/` has no UI; send users to the dashboard or sign-in.
 */
export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
