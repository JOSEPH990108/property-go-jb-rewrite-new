// src\lib\auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";
import { sendSMS } from "@/lib/sms";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
    usePlural: false,
  }),
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      allowDifferentEmails: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        console.log(`[SMS] Sending ${code} to ${phoneNumber}`);
        await sendSMS(phoneNumber, `Your OTP code is ${code}`);
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@temp.propertygo.com`;
        },
        getTempName: (phoneNumber) => {
          return `User ${phoneNumber}`;
        },
      },
    }),
  ],
  logger: {
    level: "error",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // 1 day
  },
});
