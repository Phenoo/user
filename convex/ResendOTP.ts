import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { type RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: "re_JqpwpJxt_7v4xoAcja1WYBGjHip39KLaM",
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
    console.log("[v0] Attempting to send OTP to:", email);
    console.log(provider.apiKey, "sssss");
    if (!provider.apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const resend = new ResendAPI(provider.apiKey);

    try {
      const { error } = await resend.emails.send({
        from: "My App <onboarding@resend.dev>",
        to: ["descometusah@gmail.com"],
        subject: `Sign in to My App`,
        text: "Your code is " + token,
      });

      if (error) {
        console.error("[v0] Resend API error:", error);
        throw new Error(
          `Failed to send email: ${error.message || JSON.stringify(error)}`
        );
      }

      console.log("[v0] OTP sent successfully to:", email);
    } catch (err) {
      console.error("[v0] Error sending OTP:", err);
      throw err;
    }
  },
});
