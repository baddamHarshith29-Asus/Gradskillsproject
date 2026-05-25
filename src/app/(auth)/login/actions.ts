"use server";

import { login, logout, getCurrentUser, type UserSession } from "@/lib/auth";
import { ROLE_ROUTES, type UserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function handleLoginAction(role: UserRole) {
  // Try to find if there is an employee with this role already in db to maintain consistency
  const employee = await prisma.employee.findFirst({
    where: { role },
    include: { branch: true },
  });

  const sessionUser: UserSession = {
    id: employee?.id || `usr-${role.toLowerCase()}`,
    email: employee?.email || `${role.toLowerCase()}@conexus.app`,
    name: employee?.name || role
      .replace("_", " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    role: role,
    branchId: employee?.branchId || "cmpjwkjlp0001rui0y2g2q02k", // Fallback to Downtown
    branchName: employee?.branch.name || "Downtown Innovation Hub",
  };

  await login(sessionUser);

  const defaultRoute = ROLE_ROUTES[role]?.[0] || "/dashboard";
  redirect(defaultRoute);
}

export async function handleCredentialsLoginAction(email: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { branch: true },
    });

    if (!employee) {
      return { success: false, error: "No employee account registered with this email. Please register first." };
    }

    const sessionUser: UserSession = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role as UserRole,
      branchId: employee.branchId,
      branchName: employee.branch.name,
    };

    await login(sessionUser);
    
    const defaultRoute = ROLE_ROUTES[employee.role as UserRole]?.[0] || "/dashboard";
    return { success: true, redirectUrl: defaultRoute };
  } catch (error) {
    console.error("Credentials login error:", error);
    return { success: false, error: "Authentication failed. " + String(error) };
  }
}

export async function registerEmployeeAction(data: {
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
}) {
  try {
    const existing = await prisma.employee.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return { success: false, error: "Email is already registered." };
    }

    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
      },
    });

    return { success: true, employee };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to register. " + String(error) };
  }
}

export async function handleSignOutAction() {
  await logout();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return await getCurrentUser();
}
