import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid profile email https://www.googleapis.com/auth/calendar",
        },
      },
    }),

    Password({
      verify: ResendOTP,
      reset: ResendOTPPasswordReset,
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
});
