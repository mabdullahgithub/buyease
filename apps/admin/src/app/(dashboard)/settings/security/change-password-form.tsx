"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Info,
  Laptop,
  Loader2,
  RefreshCcw,
  Shield,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActiveSessionItem = {
  id: string;
  device: string;
  location: string;
  isCurrent: boolean;
  lastSeen: string;
};

type ChangePasswordFormProps = {
  activeSessions: ActiveSessionItem[];
  userEmail: string;
};

type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500/80" };
  if (score === 3) return { score, label: "Fair", color: "bg-amber-500/80" };
  if (score === 4) return { score, label: "Good", color: "bg-cyan-500/80" };
  return { score, label: "Strong", color: "bg-emerald-500/80" };
}

function generateStrongPassword(length = 18): string {
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%^&*()-_=+?";
  const chars = `${lowercase}${uppercase}${digits}${symbols}`;

  const ensure = [
    lowercase[Math.floor(Math.random() * lowercase.length)] ?? "a",
    uppercase[Math.floor(Math.random() * uppercase.length)] ?? "A",
    digits[Math.floor(Math.random() * digits.length)] ?? "2",
    symbols[Math.floor(Math.random() * symbols.length)] ?? "!",
  ];

  while (ensure.length < length) {
    const next = chars[Math.floor(Math.random() * chars.length)];
    ensure.push(next ?? "a");
  }

  return ensure.sort(() => Math.random() - 0.5).join("");
}

function generateRecoveryCodes(total = 6): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: total }, () => {
    const block = () =>
      Array.from(
        { length: 4 },
        () => chars[Math.floor(Math.random() * chars.length)] ?? "A"
      ).join("");
    return `${block()}-${block()}-${block()}`;
  });
}

export function ChangePasswordForm({ activeSessions, userEmail }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [signOutOtherSessions, setSignOutOtherSessions] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showEnableSuccessDialog, setShowEnableSuccessDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedRecoveryCodes, setCopiedRecoveryCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const authenticatorSecret = useMemo(() => "JBSW-Y3DP-EHPK-3PXP-BUYE-ASE2-FA42", []);
  const otpauthUri = useMemo(
    () =>
      `otpauth://totp/BuyEase:admin?secret=${authenticatorSecret.replaceAll("-", "")}&issuer=BuyEase`,
    [authenticatorSecret]
  );
  const qrCodeImage = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUri)}`,
    [otpauthUri]
  );

  useEffect(() => {
    // defer state updates until after initial render boundary to avoid hydration warnings
    setTimeout(() => {
      setSuggestedPassword(generateStrongPassword());
    }, 0);
  }, []);

  const copySuggestion = async () => {
    await navigator.clipboard.writeText(suggestedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(authenticatorSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 1200);
  };

  const enableTwoFactor = () => {
    setTwoFactorError(null);
    if (verificationCode.trim().length !== 6) {
      setTwoFactorError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    const nextRecoveryCodes = generateRecoveryCodes();
    setRecoveryCodes(nextRecoveryCodes);
    setVerificationCode("");
    setTwoFactorEnabled(true);
    setShowEnableDialog(false);
    setShowEnableSuccessDialog(true);
  };

  const copyRecoveryCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedRecoveryCodes(true);
    setTimeout(() => setCopiedRecoveryCodes(false), 1200);
  };

  const downloadRecoveryCodes = () => {
    const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "buyease-recovery-codes.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const disableTwoFactor = () => {
    setTwoFactorError(null);
    if (!disablePassword.trim()) {
      setTwoFactorError("Confirm your password to deactivate two-factor authentication.");
      return;
    }
    setDisablePassword("");
    setTwoFactorEnabled(false);
    setShowDisableDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (strength.score < 4) {
      setError("Use a stronger password before updating.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update password.");
        setLoading(false);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(data.message ?? "Password updated successfully.");
      setLoading(false);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="size-4" />
              Change Password
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <Info className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use a strong password and rotate it regularly.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <InputGroup>
                <InputGroupInput
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={showCurrent ? "Hide current password" : "Show current password"}
                    onClick={() => setShowCurrent((prev) => !prev)}
                    size="icon-xs"
                  >
                    {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <InputGroup>
                <InputGroupInput
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={showNew ? "Hide new password" : "Show new password"}
                    onClick={() => setShowNew((prev) => !prev)}
                    size="icon-xs"
                  >
                    {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <InputGroup>
                <InputGroupInput
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirm((prev) => !prev)}
                    size="icon-xs"
                  >
                    {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password strength</span>
                <span className="font-medium">{strength.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${strength.color} transition-all`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <div className="mb-2 flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">{activeSessions.length} active sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Changing password can require re-authentication on other devices.
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border bg-background"
                  checked={signOutOtherSessions}
                  onChange={(e) => setSignOutOtherSessions(e.target.checked)}
                />
                Sign out all other sessions after changing
              </label>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-500">{success}</p> : null}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Password Assistant
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate a secure password and use it directly.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input readOnly value={suggestedPassword} className="font-mono text-xs" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setSuggestedPassword(generateStrongPassword())}>
                <RefreshCcw className="size-4" />
                Regenerate
              </Button>
              <Button type="button" variant="outline" onClick={() => void copySuggestion()}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Active sessions</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recent authenticated sessions for your admin account.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent sessions detected.</p>
            ) : (
              <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
                {activeSessions.map((session) => (
                  <div key={session.id} className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">{session.device}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {session.isCurrent ? "Current" : session.lastSeen}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{session.location}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Laptop className="size-3.5" />
                      {session.lastSeen}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Shield className="size-4" />
              Two-factor authentication
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                twoFactorEnabled
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {twoFactorEnabled ? "Enabled" : "Not enabled"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add an extra authentication layer to protect admin access. Use Google Authenticator or
            another TOTP app.
          </p>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {twoFactorEnabled
                    ? "Your account is protected by two-factor authentication."
                    : "Enable 2FA to secure this account."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recovery codes are required in case your authenticator device is lost.
                </p>
              </div>
              {twoFactorEnabled ? (
                <Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
                  Deactivate
                </Button>
              ) : (
                <Button onClick={() => setShowEnableDialog(true)}>Enable 2FA</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showEnableDialog}
        onOpenChange={(open) => {
          setShowEnableDialog(open);
          setTwoFactorError(null);
        }}
      >
        <DialogContent className="max-w-[480px] p-0 sm:max-w-[500px]">
          <div className="p-6 pb-4">
            <DialogHeader className="mb-6 space-y-1.5">
              <DialogTitle className="text-xl font-semibold">Enable two-step authentication</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app and enter the 6-digit code.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="mx-auto shrink-0 rounded-xl border bg-white p-3 shadow-sm sm:mx-0">
                <img
                  src={qrCodeImage}
                  alt="Scan this QR code with authenticator app"
                  className="size-44"
                />
              </div>

              <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setup key</p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-6"
                      onClick={() => void copySecret()}
                    >
                      {copiedSecret ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                         <Copy className="size-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <Input value={authenticatorSecret} readOnly className="h-8 font-mono text-xs tracking-wider" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Verification code
                  </Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="0 0 0 0 0 0"
                    inputMode="numeric"
                    maxLength={6}
                    className="h-11 text-center font-mono text-lg tracking-[0.4em]"
                  />
                </div>
              </div>
            </div>

            {twoFactorError ? (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <p>{twoFactorError}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="px-6 pb-6 pt-2">
            <Button variant="ghost" onClick={() => setShowEnableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={enableTwoFactor} disabled={verificationCode.length !== 6}>
              Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEnableSuccessDialog} onOpenChange={setShowEnableSuccessDialog}>
        <DialogContent className="max-w-[500px] p-0" showCloseButton={false}>
          <div className="p-6 pb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="shrink-0 rounded-full bg-emerald-500/15 p-3 text-emerald-500">
                <Shield className="size-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold">Two-factor enabled</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Your account is now protected with an extra layer of security.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recovery codes
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => void copyRecoveryCodes()} title="Copy codes">
                    {copiedRecoveryCodes ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </Button>
                  <Button variant="secondary" size="icon-sm" onClick={downloadRecoveryCodes} title="Download codes">
                    <Download className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {recoveryCodes.map((code) => (
                  <div
                    key={code}
                    className="flex h-10 items-center justify-center rounded-md border bg-muted/30 font-mono text-[13px] tracking-widest"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Store these recovery codes securely. They are the <strong>only way</strong> to recover your account if you lose access to your authenticator app.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Primary method
                  </span>
                  <span className="font-medium">Authenticator app</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-2">
            <Button onClick={() => setShowEnableSuccessDialog(false)}>Finish setup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDisableDialog}
        onOpenChange={(open) => {
          setShowDisableDialog(open);
          setTwoFactorError(null);
        }}
      >
        <DialogContent className="max-w-[440px] p-0">
          <div className="p-6 pb-4">
            <DialogHeader className="mb-6 space-y-1.5">
              <DialogTitle className="text-xl font-semibold">Deactivate two-step authentication</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter your password to deactivate the two-step authentication login.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input value={userEmail} readOnly className="bg-muted/30" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disable-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm password
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(event) => setDisablePassword(event.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputGroupAddon align="inline-end">
                    <Eye className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            {twoFactorError ? (
              <div className="mt-5 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <p>{twoFactorError}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="px-6 pb-6 pt-2">
            <Button variant="ghost" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={disableTwoFactor} disabled={!disablePassword}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
