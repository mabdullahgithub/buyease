import { redirect } from "next/navigation";

/**
 * The OAuth callback is handled by the API route at /api/auth.
 * This page only exists to match the (auth) route group and will
 * never be rendered — Shopify redirects to /api/auth?... directly.
 */
export default function CallbackPage() {
  redirect("/install");
}
