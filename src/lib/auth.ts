import { cookies } from "next/headers";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "COMMUNITY_LEAD" | "FINANCE" | "MEMBER" | "VISITOR";
  branchId?: string;
  branchName?: string;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("conexus-session")?.value;
    if (!session) return null;
    return JSON.parse(session) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function login(user: UserSession) {
  const cookieStore = await cookies();
  cookieStore.set("conexus-session", JSON.stringify(user), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("conexus-session");
}
