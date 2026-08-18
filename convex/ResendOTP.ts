import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { type RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Resend({
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
    console.log("[ResendOTP] Sending verification OTP to:", email);

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
        subject: `Your Usoro Verification Code: ${token}`,
        text: `Your verification code is ${token}. Enter this code to verify your account.`,
      });

      if (error) {
        console.error("[ResendOTP] Resend API error:", error);
        throw new Error(
          `Failed to send verification email: ${error.message || JSON.stringify(error)}`
        );
      }

      console.log("[ResendOTP] Verification OTP sent successfully to:", email);
    } catch (err) {
      console.error("[ResendOTP] Error sending OTP:", err);
      throw err;
    }
  },
});
