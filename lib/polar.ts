import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
  server: "production",
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});
