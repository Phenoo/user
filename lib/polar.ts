import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
  server: "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});
