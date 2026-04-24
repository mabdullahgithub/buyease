/**
 * InstallOAuthGate is no longer needed.
 *
 * The app now uses server-side token exchange on page load,
 * eliminating the need for client-side auth detection and redirects.
 *
 * This file is kept as a no-op to avoid breaking any remaining imports.
 */
export function InstallOAuthGate(): null {
  return null;
}
