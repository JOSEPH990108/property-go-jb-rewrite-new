import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Wraps the repeated `auth.api.getSession({ headers: await headers() })` call.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

type RequireAdminOk = {
  ok: true;
  user: typeof user.$inferSelect & { role: { code: string } | null };
};
type RequireAdminFail = { ok: false; error: string };

/**
 * Shared admin auth guard for server actions.
 * Checks session, resolves DB user, and verifies ADMIN or SUPER_ADMIN role.
 */
export async function requireAdmin(): Promise<RequireAdminOk | RequireAdminFail> {
  if (!db) return { ok: false, error: "Database unavailable" };

  const session = await getServerSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: { role: true },
  });

  if (!dbUser) return { ok: false, error: "User not found" };

  const roleCode = dbUser.role?.code;
  if (roleCode !== "ADMIN" && roleCode !== "SUPER_ADMIN") {
    return { ok: false, error: "Admin access required" };
  }

  return { ok: true, user: dbUser };
}
