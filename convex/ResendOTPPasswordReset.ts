import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { type RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey:
    process.env.RESEND_API_KEY ||
    process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 5;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const apiKey =
      provider.apiKey ||
      process.env.RESEND_API_KEY ||
      process.env.AUTH_RESEND_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const resend = new ResendAPI(apiKey);

    try {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Usoro <onboarding@resend.dev>",
        to: [email],
        subject: `Reset your Usoro password`,
        text: `Your password reset code is ${token}. Enter this code to reset your password.`,
      });

      if (error) {
        throw new Error(
          `Failed to send reset email: ${error.message || JSON.stringify(error)}`
        );
      }
    } catch (err) {
      console.error("[ResendPasswordReset] Error sending reset OTP:", err);
      throw err;
    }
  },
});
