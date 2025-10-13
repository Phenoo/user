import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
  server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});
