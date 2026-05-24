import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRouteAllowed, ROLE_ROUTES, type UserRole } from "./lib/rbac";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Let Next.js assets, API routes, and favicon pass through
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("conexus-session")?.value;
  let user: { role: string } | null = null;

  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie);
    } catch (e) {
      // Ignore parse issues
    }
  }

  const isLoginPage = path === "/login";
  const isKioskPage = path === "/kiosk" || path.startsWith("/kiosk/");

  // Not logged in
  if (!user) {
    if (!isLoginPage && !isKioskPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Logged in and trying to access login page
  if (isLoginPage) {
    const role = user.role as UserRole;
    const defaultRoute = ROLE_ROUTES[role]?.[0] || "/dashboard";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // Root redirect
  if (path === "/") {
    const role = user.role as UserRole;
    const defaultRoute = ROLE_ROUTES[role]?.[0] || "/dashboard";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // Route authorization check
  const role = user.role as UserRole;
  if (!isRouteAllowed(role, path)) {
    const defaultRoute = ROLE_ROUTES[role]?.[0] || "/dashboard";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
