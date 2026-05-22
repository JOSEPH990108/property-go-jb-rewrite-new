// src\app\actions\auth-actions.ts
"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getRedirectByRole } from "@/lib/auth-redirect";
import { setRoleCookie, clearRoleCookie } from "@/lib/role-cookie";

export { clearRoleCookie };

/**
 * Returns the redirect path based on user role.
 */
async function getUserRoleCode(userId: string): Promise<string | null> {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: { role: true },
  });
  return dbUser?.role?.code ?? null;
}

async function getUserByPhoneNumber(phoneNumber: string) {
  return db.query.user.findFirst({
    where: eq(user.phoneNumber, phoneNumber),
    with: { role: true },
  });
}

async function getUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(user.email, email),
    with: { role: true },
  });
}

/**
 * Ensures sign-in OTP can only be requested by existing users.
 */
export async function canRequestSignInOtp(phoneNumber: string) {
  try {
    const existingUser = await getUserByPhoneNumber(phoneNumber);
    if (!existingUser) {
      return {
        success: false,
        error: "No account found for this phone number. Please sign up first.",
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to check account";
    return { success: false, error: message };
  }
}

/**
 * Verifies a phone OTP and creates a session.
 */
export async function verifyPhoneOtp(
  phoneNumber: string,
  otp: string,
  rememberMe: boolean
) {
  return verifyPhoneOtpInternal(phoneNumber, otp, rememberMe, false);
}

/**
 * Verifies a phone OTP for sign-in only.
 * Blocks verification for unknown phone numbers to keep sign-in and sign-up separate.
 */
export async function verifyPhoneOtpForSignIn(
  phoneNumber: string,
  otp: string,
  rememberMe: boolean
) {
  return verifyPhoneOtpInternal(phoneNumber, otp, rememberMe, true);
}

async function verifyPhoneOtpInternal(
  phoneNumber: string,
  otp: string,
  rememberMe: boolean,
  requireExistingUser: boolean
) {
  try {
    if (requireExistingUser) {
      const existingUser = await getUserByPhoneNumber(phoneNumber);
      if (!existingUser) {
        return {
          success: false,
          error: "No account found for this phone number. Please sign up first.",
        };
      }
    }

    const result = await auth.api.verifyPhoneNumber({
      body: { phoneNumber, code: otp },
      headers: await headers(),
    });

    if (!result?.token) {
      return { success: false, error: "Invalid OTP" };
    }

    // Prefer role lookup by verified user id, then session id, then phone number.
    // Better-Auth can occasionally return a partial user object during OTP verify.
    const verifiedUser = result.user;

    let roleCode: string | null = null;

    if (verifiedUser?.id) {
      roleCode = await getUserRoleCode(verifiedUser.id);
    }

    if (!roleCode) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        roleCode = await getUserRoleCode(session.user.id);
      }

      if (!roleCode && session?.user?.email) {
        const dbUserByEmail = await getUserByEmail(session.user.email);
        roleCode = dbUserByEmail?.role?.code ?? null;
      }
    }

    const dbUserByPhone = !roleCode
      ? await getUserByPhoneNumber(phoneNumber)
      : null;

    if (!roleCode && dbUserByPhone?.role?.code) {
      roleCode = dbUserByPhone.role.code;
    }

    const isNewUser = Boolean(
      !dbUserByPhone?.onboardingCompleted ||
      dbUserByPhone?.name?.startsWith("User +") ||
      !dbUserByPhone?.name
    );

    await setRoleCookie(roleCode);

    void rememberMe;

    return {
      success: true,
      isNewUser,
      redirectTo: getRedirectByRole(roleCode),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Verification failed";
    return { success: false, error: message };
  }
}

/**
 * Re-resolves redirect target from the current session after login.
 * This is used as a safety net when OTP verify returns partial user data.
 */
export async function getCurrentUserRedirect() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, redirectTo: "/" };
    }

    let roleCode = await getUserRoleCode(session.user.id);

    if (!roleCode && session.user.email) {
      const dbUserByEmail = await getUserByEmail(session.user.email);
      roleCode = dbUserByEmail?.role?.code ?? null;
    }

    await setRoleCookie(roleCode);

    return {
      success: true,
      redirectTo: getRedirectByRole(roleCode),
    };
  } catch {
    return { success: false, redirectTo: "/" };
  }
}

export async function getOnboardingStatus() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, completed: false, dismissedToday: false, error: "Unauthorized" };
    }

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { onboardingCompleted: true, name: true },
    });

    if (!dbUser) {
      return { success: false, completed: false, dismissedToday: false, error: "User not found" };
    }

    return {
      success: true,
      completed: dbUser.onboardingCompleted,
      userName: dbUser.name,
      dismissedToday: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get onboarding status";
    return { success: false, completed: false, dismissedToday: false, error: message };
  }
}

export async function dismissOnboardingForToday() {
  // Client currently handles per-day dismissal in localStorage.
  // Keep this server action for compatibility with existing UI flow.
  return { success: true };
}

export async function getAccountMethods() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const accounts = await db.query.account.findMany({
      where: eq(account.userId, session.user.id),
    });

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { phoneNumber: true, phoneNumberVerified: true },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const google = accounts.some((acc) => acc.providerId === "google");
    const hasPassword = accounts.some((acc) => Boolean(acc.password));
    const phone = Boolean(dbUser.phoneNumber && dbUser.phoneNumberVerified);

    return { success: true, methods: { google, hasPassword, phone } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch account methods";
    return { success: false, error: message };
  }
}

export async function unlinkGoogleAccount() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const methodsRes = await getAccountMethods();
    if (!methodsRes.success || !methodsRes.methods) {
      return { success: false, error: methodsRes.error || "Unable to verify login methods" };
    }

    const hasOtherMethods = methodsRes.methods.hasPassword || methodsRes.methods.phone;
    if (!hasOtherMethods && methodsRes.methods.google) {
      return {
        success: false,
        error: "You cannot disconnect your only login method. Set up a password or verified phone first.",
      };
    }

    await db
      .delete(account)
      .where(and(eq(account.userId, session.user.id), eq(account.providerId, "google")));

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to unlink Google account";
    return { success: false, error: message };
  }
}

export async function deleteUserAccount() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(user).where(eq(user.id, session.user.id));
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete account";
    return { success: false, error: message };
  }
}

/**
 * Updates user profile after signup (name + optional referral code).
 */
export async function updateProfileAfterSignup(data: {
  name: string;
  referralCode?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const updateData: Record<string, unknown> = {
      name: data.name,
      onboardingCompleted: true,
    };

    if (data.referralCode) {
      const referrer = await db.query.user.findFirst({
        where: eq(user.referralCode, data.referralCode),
      });
      if (referrer) {
        updateData.referredByUserId = referrer.id;
      }
    }

    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, session.user.id));

    const roleCode = await getUserRoleCode(session.user.id);
    await setRoleCookie(roleCode);

    return { success: true, redirectTo: getRedirectByRole(roleCode) };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: message };
  }
}
