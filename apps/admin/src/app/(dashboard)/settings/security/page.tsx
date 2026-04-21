import { requireAdminSession } from "@/lib/admin-session";
import { ChangePasswordForm } from "./change-password-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AccountSecurityPage() {
  const session = await requireAdminSession();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security and authentication methods. Signed in as{" "}
          <span className="font-mono text-foreground">{session.user.email}</span>
        </p>
      </div>

      <ChangePasswordForm />

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication (2FA)</CardTitle>
          <CardDescription>
            Add an extra layer of security to your admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled className="cursor-not-allowed">
            Enable 2FA (coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
