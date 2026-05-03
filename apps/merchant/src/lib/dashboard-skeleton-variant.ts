/**
 * Maps the current pathname to a loading UI variant for dashboard routes.
 * Keep in sync with `src/app/(dashboard)` pages and `providers.tsx` nav.
 */
export type DashboardSkeletonVariant =
  | "billing-plans"
  | "form-builder"
  | "coming-soon"
  | "standard";

export function getDashboardSkeletonVariant(pathname: string | null): DashboardSkeletonVariant {
  if (pathname == null || pathname === "") {
    return "standard";
  }

  const path = pathname.replace(/\/$/, "") || "/";

  if (path.startsWith("/billing")) {
    return "billing-plans";
  }
  if (path.startsWith("/form-builder")) {
    return "form-builder";
  }

  if (
    path === "/" ||
    path.startsWith("/analytics") ||
    path.startsWith("/settings") ||
    path.startsWith("/upsells")
  ) {
    return "coming-soon";
  }

  return "standard";
}
