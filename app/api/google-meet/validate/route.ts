import { type NextRequest, NextResponse } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import {
  getRequiredGoogleScopes,
  hasGoogleScopes,
} from "@/lib/integrations/google/scopes";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";
import { GoogleAuthError } from "@/lib/integrations/google/tokens";

export async function GET(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  try {
    const credentials = await resolveGoogleCredentials(
      request,
      authentication
    );
    const capabilities = {
      hasClassroom: hasGoogleScopes(
        credentials.scopes,
        getRequiredGoogleScopes("classroom")
      ),
      hasDrive: hasGoogleScopes(
        credentials.scopes,
        getRequiredGoogleScopes("drive")
      ),
      hasCalendar: hasGoogleScopes(
        credentials.scopes,
        getRequiredGoogleScopes("calendar")
      ),
    };

    const providerCapabilities = [
      { provider: "google-classroom" as const, connected: capabilities.hasClassroom },
      { provider: "google-drive" as const, connected: capabilities.hasDrive },
      { provider: "google-calendar" as const, connected: capabilities.hasCalendar },
    ];
    const existingAccounts = await Promise.all(
      providerCapabilities.map(({ provider }) =>
        fetchQuery(
          api.integrations.getConnectedAccount,
          { userId: authentication.user._id, provider },
          { token: authentication.token }
        )
      )
    );

    await Promise.all(
      providerCapabilities.map(({ provider, connected }, index) => {
        const existingAccount = existingAccounts[index];
        return connected
          ? fetchMutation(
              api.integrations.upsertConnectedAccount,
              {
                userId: authentication.user._id,
                provider,
                email: credentials.email,
                scopes: credentials.scopes,
                status: "connected",
              },
              { token: authentication.token }
            )
          : existingAccount
            ? fetchMutation(
                api.integrations.upsertConnectedAccount,
                {
                  userId: authentication.user._id,
                  provider,
                  email: existingAccount.email,
                  scopes: existingAccount.scopes,
                  status: "needs_reauth",
                },
                { token: authentication.token }
              )
            : Promise.resolve();
      })
    );

    const response = NextResponse.json({
      connected: true,
      ...capabilities,
      email: credentials.email,
      scopes: credentials.scopes,
    });
    response.headers.set("Cache-Control", "no-store, private");
    setGoogleCredentialCookies(response, credentials);
    return response;
  } catch (error) {
    console.warn("[GoogleValidate] Connection validation failed:", error);
    const needsReauth =
      error instanceof GoogleAuthError && error.code !== "NOT_CONNECTED";

    if (needsReauth) {
      try {
        const providers = [
          "google-classroom",
          "google-drive",
          "google-calendar",
        ] as const;
        const accounts = await Promise.all(
          providers.map((provider) =>
            fetchQuery(
              api.integrations.getConnectedAccount,
              { userId: authentication.user._id, provider },
              { token: authentication.token }
            )
          )
        );
        await Promise.all(
          accounts.map((account, index) =>
            account
              ? fetchMutation(
                  api.integrations.upsertConnectedAccount,
                  {
                    userId: authentication.user._id,
                    provider: providers[index],
                    email: account.email,
                    scopes: account.scopes,
                    status: "needs_reauth",
                  },
                  { token: authentication.token }
                )
              : Promise.resolve()
          )
        );
      } catch (statusError) {
        console.warn("[GoogleValidate] Could not reconcile connection status:", statusError);
      }
    }

    const response = NextResponse.json({
      connected: false,
      needsReauth,
    });
    response.cookies.delete("google_meet_token");
    response.cookies.delete("google_meet_refresh_token");
    return response;
  }
}
