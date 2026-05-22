// src\app\(main)\profile\page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

import { UserInfoCard } from "@/components/profile/UserInfoCard";
import { UserAddressCard } from "@/components/profile/UserAddressCard";
import { UserPreferenceCard } from "@/components/profile/UserPreferenceCard";
import { DeleteAccountCard } from "@/components/profile/DeleteAccountCard";
import { ReferralCodeCard } from "@/components/profile/ReferralCodeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReferralDashboard from "@/components/custom/referral/ReferralDashboard";

function parseGoogleEmailFromIdToken(idToken: string | null | undefined): string | null {
  if (!idToken) {
    return null;
  }

  try {
    const parts = idToken.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadRaw) as { email?: string; email_verified?: boolean };

    if (!payload.email || payload.email_verified !== true) {
      return null;
    }

    return payload.email;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin"); // Or wherever login is
  }

  // If a phone-created temp email account links Google, promote to verified Google email.
  const currentUser = await db.query.user.findFirst({
    where: (table, { eq }) => eq(table.id, session.user.id),
    columns: { id: true, email: true },
  });

  if (currentUser?.email?.endsWith("@temp.propertygo.com")) {
    const googleAccount = await db.query.account.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, session.user.id), eq(table.providerId, "google")),
      columns: { idToken: true },
    });

    const googleEmail = parseGoogleEmailFromIdToken(googleAccount?.idToken);

    if (googleEmail && googleEmail !== currentUser.email) {
      const existingOwner = await db.query.user.findFirst({
        where: (table, { eq }) => eq(table.email, googleEmail),
        columns: { id: true },
      });

      if (!existingOwner || existingOwner.id === session.user.id) {
        await db
          .update(user)
          .set({
            email: googleEmail,
            emailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(user.id, session.user.id));
      }
    }
  }

  // Fetch full user data to ensure we have latest fields (nationality, phone, etc.)
  // Session might be stale or contain limited info.
  const dbUser = await db.query.user.findFirst({
      where: (table, { eq }) => eq(table.id, session.user.id),
      with: {
          preferences: true
      }
  });

  if (!dbUser) {
       redirect("/signin");
  }

  // Safe defaults if preferences are missing
  const userPrefs = {
      language: dbUser.preferences?.language ?? "en",
      currency: dbUser.preferences?.currency ?? "MYR",
      notificationSettings: (dbUser.preferences?.notificationSettings as { email: boolean; whatsapp: boolean }) ?? { email: true, whatsapp: true },
  };

  return (
    <div className="container py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile, preferences, and referrals.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
                <TabsTrigger value="profile">Profile & Settings</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-1 md:col-span-2">
                        <UserInfoCard
                            user={{
                                name: dbUser.name,
                                email: dbUser.email,
                                phoneNumber: dbUser.phoneNumber,
                            }}
                        />
                    </div>

                    <div className="col-span-1">
                        <UserAddressCard
                            nationality={dbUser.nationality}
                            userName={dbUser.name}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <UserPreferenceCard preferences={userPrefs} />
                    </div>

                    {!dbUser.referredByUserId && (
                        <div className="col-span-1 md:col-span-3">
                            <ReferralCodeCard userId={dbUser.id} />
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-3">
                        <DeleteAccountCard />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="referrals">
                 <ReferralDashboard />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
