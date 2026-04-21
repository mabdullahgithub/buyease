export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "VIEWER"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const ALL_ROLES = new Set<AdminRole>(ADMIN_ROLES);

type PathRule = {
  pattern: RegExp;
  roles: readonly AdminRole[];
};

const PATH_RULES: PathRule[] = [
  { pattern: /^\/api\/admin\/auth\/change-password(?:\/|$)/, roles: ADMIN_ROLES },
  { pattern: /^\/dashboard(?:\/|$)/, roles: ADMIN_ROLES },
  { pattern: /^\/analytics(?:\/|$)/, roles: ADMIN_ROLES },
  { pattern: /^\/account(?:\/|$)/, roles: ADMIN_ROLES },
  { pattern: /^\/merchants(?:\/|$)/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/logs(?:\/|$)/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/plans(?:\/|$)/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/settings(?:\/|$)/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/recent-activities(?:\/|$)/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/api\/admin(?:\/|$)/, roles: ["SUPER_ADMIN"] },
];

export function isValidAdminRole(role: string | null | undefined): role is AdminRole {
  return role ? ALL_ROLES.has(role as AdminRole) : false;
}

export function getAllowedRolesForPath(pathname: string): readonly AdminRole[] | null {
  for (const rule of PATH_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule.roles;
    }
  }
  return null;
}

export function canAccessPath(pathname: string, role: string | null | undefined): boolean {
  const allowedRoles = getAllowedRolesForPath(pathname);
  if (!allowedRoles) return true;
  if (!isValidAdminRole(role)) return false;
  return allowedRoles.includes(role);
}
