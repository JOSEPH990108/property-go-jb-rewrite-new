// src\app\actions\admin-auth-actions.ts
"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { setRoleCookie } from "@/lib/role-cookie";
import { getServerSession } from "@/lib/server-auth";

/**
 * Validates an admin login: signs in with email/password,
 * then checks the user has ADMIN or SUPER_ADMIN role.
 */
export async function adminSignIn(email: string, password: string) {
  try {
    // Use Better-Auth email/password sign-in
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    if (!result?.user?.id) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check the role in the database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, result.user.id),
      with: { role: true },
    });

    if (!dbUser) {
      return { success: false, error: "User account not found" };
    }

    const roleCode = dbUser.role?.code;
    if (roleCode !== "ADMIN" && roleCode !== "SUPER_ADMIN") {
      // Sign out the non-admin user to clear the session
      await auth.api.signOut({ headers: await headers() });
      return { success: false, error: "Access denied. Admin privileges required." };
    }

    // Set role cookie so middleware recognises the admin
    await setRoleCookie(roleCode);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sign in failed. Please try again.";
    return { success: false, error: message };
  }
}

/**
 * Returns the current session's admin user info, or null if not an admin.
 */
export async function getAdminSession() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return null;

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: { role: true },
    });

    if (!dbUser) return null;

    const roleCode = dbUser.role?.code;
    if (roleCode !== "ADMIN" && roleCode !== "SUPER_ADMIN") return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: roleCode,
    };
  } catch {
    return null;
  }
}
