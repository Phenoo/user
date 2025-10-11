import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
  server: "sandbox",
  // server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
  accessToken: "polar_oat_sk5VzWwECiW8mlguInjNlXm5CHyp9De8e8x4Y16mYQO",
  // accessToken: process.env.POLAR_ACCESS_TOKEN,
});
