import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Signed in as{" "}
          <span className="font-mono text-foreground">{session.user.email}</span>
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
