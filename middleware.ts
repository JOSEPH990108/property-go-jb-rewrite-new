import { NextRequest, NextResponse } from "next/server";

const AGENT_ROLES = new Set(["AGENT", "ADMIN", "SUPER_ADMIN"]);
const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const roleCode = request.cookies.get("pgb-role")?.value;

  // Protect /agent/* routes
  if (pathname.startsWith("/agent")) {
    if (!sessionToken) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // If role cookie present but wrong role, redirect to home
    if (roleCode && !AGENT_ROLES.has(roleCode)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect /admin/* routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // If role cookie present but wrong role, redirect to home
    if (roleCode && !ADMIN_ROLES.has(roleCode)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/agent/:path*", "/admin/:path*"],
};
