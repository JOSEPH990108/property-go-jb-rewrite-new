import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getRedirectByRole } from "@/lib/auth-redirect";
import { setRoleCookie } from "@/lib/role-cookie";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: { role: true },
    });

    const roleCode = dbUser?.role?.code ?? null;

    // Set role cookie
    await setRoleCookie(roleCode);

    // Send new Google users through onboarding (handled on home page)
    const isNewUser =
      !dbUser?.onboardingCompleted || dbUser?.name?.startsWith("User +") || !dbUser?.name;

    if (isNewUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(new URL(getRedirectByRole(roleCode), request.url));
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
