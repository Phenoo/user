import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),

    Password({
      verify: ResendOTP,
      reset: ResendOTPPasswordReset,
      profile(params) {
        return {
          email: ((params.email as string) || "").trim().toLowerCase(),
          name: ((params.name as string) || "").trim(),
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const email = args.profile.email as string;
      const name =
        (args.profile.name as string) ||
        (args.profile.given_name as string) ||
        undefined;
      const image =
        (args.profile.image as string) ||
        (args.profile.picture as string) ||
        undefined;
      const emailVerified = args.profile.emailVerified ?? true;

      const userData: {
        email: string;
        name?: string;
        image?: string;
        emailVerificationTime?: number;
      } = {
        email,
        ...(name !== undefined ? { name } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(emailVerified ? { emailVerificationTime: Date.now() } : {}),
      };

      // 1. If an existingUserId was found in authAccounts, check if it actually exists in `users`
      if (args.existingUserId) {
        const existingUser = await ctx.db.get(args.existingUserId);
        if (existingUser) {
          await ctx.db.patch(args.existingUserId, userData);
          return args.existingUserId;
        }
      }

      // 2. Check if a user with this email already exists in `users`
      if (email) {
        const existingByEmail = await (ctx.db.query("users") as any)
          .withIndex("email", (q: any) => q.eq("email", email))
          .first();

        if (existingByEmail) {
          await ctx.db.patch(existingByEmail._id, userData);
          return existingByEmail._id;
        }
      }

      // 3. Otherwise, create a new user record
      return await ctx.db.insert("users", userData);
    },
  },
});
