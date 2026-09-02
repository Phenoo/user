import "server-only";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";

export async function getAuthenticatedUser() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return null;
  }

  const user = await fetchQuery(api.users.currentUser, {}, { token });
  return user ? { token, user } : null;
}

export async function getAuthenticatedSubscription() {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return null;
  }

  const subscription = await fetchQuery(
    api.subscriptions.getCurrentSubscription,
    { userId: authentication.user._id },
    { token: authentication.token }
  );

  return { ...authentication, subscription };
}
