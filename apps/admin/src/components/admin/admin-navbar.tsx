"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronRight, CircleUser, LogOut, Search, ShieldCheck, Upload } from "lucide-react";

import { AdminCommandMenu } from "@/components/admin/admin-command-menu";
import { BrandLogo } from "@/components/admin/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/* ── helpers ─────────────────────────────────────────────── */

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  merchants: "Merchants",
  plans: "Plans",
  analytics: "Analytics",
  logs: "Logs",
  settings: "Settings",
  system: "System",
  "recent-activities": "Recent activity",
  account: "Account",
  security: "Security",
};

function toLabel(seg: string) {
  return (
    SEGMENT_LABELS[seg] ??
    (/^[a-f0-9-]{8,}$/i.test(seg)
      ? "Details"
      : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "))
  );
}

function useBreadcrumbs(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .reduce<{ href: string; label: string }[]>((acc, seg) => {
      const prev = acc[acc.length - 1]?.href ?? "";
      acc.push({ href: `${prev}/${seg}`, label: toLabel(seg) });
      return acc;
    }, []);
}

function initialsFrom(email: string | null | undefined) {
  if (!email) return "A";
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/).filter(Boolean);
  return parts.length >= 2
    ? ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
    : local.slice(0, 2).toUpperCase();
}

/** 1 px vertical rule, fixed 16 px, perfectly centred */
function VRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      style={{ height: 16 }}
      className={cn("inline-block w-px shrink-0 self-center bg-border", className)}
    />
  );
}

/** Uniform 28 × 28 ghost icon button */
function NavBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 shrink-0 items-center justify-center rounded-[5px] text-muted-foreground transition-colors duration-75 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

/* ── component ───────────────────────────────────────────── */

export function AdminNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState("");
  const [profileAvatar, setProfileAvatar] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [draftAvatar, setDraftAvatar] = React.useState<string | null>(null);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const crumbs = useBreadcrumbs(pathname);

  const email = session?.user?.email ?? "";
  const displayName =
    profileName ||
    (session?.user as { name?: string } | undefined)?.name?.trim() ||
    (email ? email.split("@")[0] : "Admin");

  React.useEffect(() => {
    let mounted = true;
    if (!email) return;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/admin/profile", { method: "GET" });
        const data = (await response.json()) as {
          ok?: boolean;
          profile?: { displayName?: string | null; avatarDataUrl?: string | null };
        };
        if (!mounted || !response.ok || !data.ok) return;
        setProfileName((data.profile?.displayName ?? "").trim());
        setProfileAvatar(data.profile?.avatarDataUrl ?? null);
      } catch {
        // keep graceful fallback to session display data
      }
    };

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, [email]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleOpenProfileModal = () => {
    setProfileError(null);
    setDraftName(displayName);
    setDraftAvatar(profileAvatar);
    setProfileModalOpen(true);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setDraftAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!email) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      const formData = new FormData();
      formData.set("displayName", draftName.trim());
      if (draftAvatar === null && profileAvatar !== null) {
        formData.set("removeImage", "true");
      }

      if (draftAvatar && draftAvatar.startsWith("data:")) {
        const [meta, payload] = draftAvatar.split(",", 2);
        const mimeType = meta.match(/^data:(.*?);base64$/)?.[1] ?? "image/png";
        const binary = atob(payload ?? "");
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const file = new File([bytes], "avatar", { type: mimeType });
        formData.set("image", file);
      }

      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        body: formData,
      });
      let data: {
        ok?: boolean;
        error?: string;
        profile?: { displayName?: string | null; avatarDataUrl?: string | null };
      } | null = null;
      try {
        data = (await response.json()) as {
          ok?: boolean;
          error?: string;
          profile?: { displayName?: string | null; avatarDataUrl?: string | null };
        };
      } catch {
        data = null;
      }
      if (!response.ok || !data?.ok) {
        setProfileError(
          data?.error ??
            `Unable to save profile right now (${response.status}). Please try again.`
        );
        return;
      }

      setProfileName((data.profile?.displayName ?? "").trim());
      setProfileAvatar(data.profile?.avatarDataUrl ?? null);
      setProfileModalOpen(false);
    } catch {
      setProfileError("Network error. Try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <>
      <AdminCommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {draftAvatar ? <AvatarImage src={draftAvatar} alt={displayName} /> : null}
                <AvatarFallback className="bg-[#5c6ac4] text-sm font-bold text-white">
                  {initialsFrom(email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile-avatar">Profile picture</Label>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="profile-avatar"
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="size-3.5" />
                    Upload
                  </Label>
                  {draftAvatar ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setDraftAvatar(null)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Your name"
                maxLength={60}
              />
            </div>
            {profileError ? <p className="text-xs text-destructive">{profileError}</p> : null}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setProfileModalOpen(false)}
              disabled={profileSaving}
            >
              Cancel
            </Button>
            <Button onClick={() => void saveProfile()} disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*
        Full-width sticky navbar — spans the entire viewport.
        Same bg as everything else → no colour clash.
        Single bottom border for structure.
      */}
      <nav className="sticky top-0 z-50 flex h-11 w-full shrink-0 items-center gap-0 border-b border-border bg-background px-2">

        {/* ── LEFT: sidebar toggle ▸ VRule ▸ logo ▸ VRule ▸ breadcrumb ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">

          {/* Sidebar hamburger — always first */}
          <SidebarTrigger className="size-7 shrink-0 rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground" />

          <VRule />

          {/* Logo + wordmark */}
          <BrandLogo href="/dashboard" width={28} />

          {/* VRule only when we have breadcrumb segments */}
          {crumbs.length > 0 && <VRule />}

          {/* Breadcrumb — scrolls horizontally if needed but never wraps */}
          {crumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1 overflow-hidden"
            >
              {crumbs.map((c: { href: string; label: string }, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <React.Fragment key={c.href}>
                    {i > 0 && (
                      <ChevronRight className="size-3 shrink-0 text-muted-foreground/40" />
                    )}
                    {isLast ? (
                      <span className="truncate text-[12px] text-foreground/70">
                        {c.label}
                      </span>
                    ) : (
                      <Link
                        href={c.href}
                        className="truncate text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {c.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── RIGHT: search ▸ bell ▸ theme ▸ VRule ▸ avatar ── */}
        <div className="flex shrink-0 items-center gap-1 pl-2">

          {/* Search */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="mr-3 flex h-8 w-[240px] shrink-0 items-center gap-1.5 rounded-[5px] border border-border/80 bg-accent/50 px-3 text-[13px] text-muted-foreground transition-colors duration-75 hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-4 shrink-0 opacity-50" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="pointer-events-none hidden select-none items-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="mr-px text-[11px] leading-none">⌘</span>K
            </kbd>
          </button>

          <NavBtn label="Notifications">
            <Bell className="size-[15px]" />
          </NavBtn>

          <ThemeToggle />

          <VRule className="mx-1" />

          {/* Avatar + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center outline-none">
              <div className="relative">
                <Avatar className="size-6">
                  {profileAvatar ? <AvatarImage src={profileAvatar} alt={displayName} /> : null}
                  <AvatarFallback className="bg-[#5c6ac4] text-[9px] font-bold text-white">
                    {initialsFrom(email)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-1.5 rounded-full border border-background bg-green-500" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 overflow-hidden rounded-lg border-border p-0"
              align="end"
              side="bottom"
              sideOffset={8}
            >
              {/* User block */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Avatar className="size-9 shrink-0">
                  {profileAvatar ? <AvatarImage src={profileAvatar} alt={displayName} /> : null}
                  <AvatarFallback className="bg-[#5c6ac4] text-[11px] font-bold text-white">
                    {initialsFrom(email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 leading-snug">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">{email}</span>
                </div>
              </div>

              <DropdownMenuSeparator className="m-0" />

              <DropdownMenuItem
                onClick={handleOpenProfileModal}
                className="cursor-pointer gap-2.5 rounded-none px-4 py-2.5 text-[13px]"
              >
                <CircleUser className="size-3.5 opacity-60" />
                My Profile
              </DropdownMenuItem>

              <Link href="/settings/security" className="block">
                <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-none px-4 py-2.5 text-[13px]">
                  <ShieldCheck className="size-3.5 opacity-60" />
                  Account Security
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="m-0" />

              <DropdownMenuItem
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className="cursor-pointer gap-2.5 rounded-none px-4 py-2.5 text-[13px]"
              >
                <LogOut className="size-3.5 opacity-60" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
