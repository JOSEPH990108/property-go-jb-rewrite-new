import { cookies } from "next/headers";

export const ROLE_COOKIE = "pgb-role";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};

export async function setRoleCookie(roleCode: string | null) {
  const jar = await cookies();
  if (roleCode) {
    jar.set(ROLE_COOKIE, roleCode, COOKIE_OPTIONS);
  } else {
    jar.delete(ROLE_COOKIE);
  }
}

export async function clearRoleCookie() {
  const jar = await cookies();
  jar.delete(ROLE_COOKIE);
}
