"use server";

import { login, logout, getCurrentUser, type UserSession } from "@/lib/auth";
import { ROLE_ROUTES, type UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export async function handleLoginAction(role: UserRole) {
  const mockUser: UserSession = {
    id: `usr-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@conexus.app`,
    name: role
      .replace("_", " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    role: role,
    branchId: "br-1", // Downtown branch ID
    branchName: "Downtown Innovation Hub",
  };

  await login(mockUser);

  const defaultRoute = ROLE_ROUTES[role]?.[0] || "/dashboard";
  redirect(defaultRoute);
}

export async function handleSignOutAction() {
  await logout();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return await getCurrentUser();
}
