export type UserRole =
  | "SUPER_ADMIN"
  | "BRANCH_MANAGER"
  | "COMMUNITY_LEAD"
  | "FINANCE"
  | "MEMBER"
  | "VISITOR";

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "/dashboard",
    "/booking",
    "/floor-builder",
    "/clients",
    "/onboarding",
    "/finance",
    "/renewals",
    "/visitors",
    "/analytics",
    "/tickets",
    "/team",
    "/settings",
    "/cms",
  ],
  BRANCH_MANAGER: [
    "/dashboard",
    "/booking",
    "/floor-builder",
    "/clients",
    "/onboarding",
    "/finance",
    "/renewals",
    "/visitors",
    "/analytics",
    "/tickets",
    "/team",
    "/settings",
    "/cms",
  ],
  COMMUNITY_LEAD: [
    "/dashboard",
    "/booking",
    "/clients",
    "/onboarding",
    "/visitors",
    "/tickets",
    "/team",
    "/settings"
  ],
  FINANCE: [
    "/dashboard",
    "/clients",
    "/finance",
    "/renewals",
    "/settings"
  ],
  MEMBER: [
    "/booking",
    "/tickets",
    "/visitors"
  ],
  VISITOR: [
    "/kiosk"
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_MANAGER: "Branch Manager",
  COMMUNITY_LEAD: "Community Lead",
  FINANCE: "Finance & Billing",
  MEMBER: "CoNexus Member",
  VISITOR: "Visitor Kiosk",
};

export function isRouteAllowed(role: UserRole, path: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  
  // Public kiosk route and check-in are allowed for everyone
  if (path === "/kiosk" || path.startsWith("/kiosk/")) return true;

  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some((route) => path === route || path.startsWith(route + "/"));
}
