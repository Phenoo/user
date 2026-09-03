"use client";

import { useEffect, useRef, useState } from "react";

export default function GoogleCallbackPage() {
  const hasSubmitted = useRef(false);
  const [message, setMessage] = useState("Completing your Google connection…");

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const callbackParams = new URLSearchParams(window.location.search);
    const hasResponse =
      callbackParams.has("code") || callbackParams.has("error");

    if (!hasResponse) {
      window.location.replace("/auth?error=invalid_callback_request");
      return;
    }

    const callbackPayload = callbackParams.toString();
    window.history.replaceState({}, "", "/google-callback");

    const submitCallback = async () => {
      try {
        const response = await fetch("/api/integrations/google/callback", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-google-oauth-relay": "1",
          },
          body: callbackPayload,
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error("The Google connection could not be completed.");
        }

        window.location.replace(response.url || "/dashboard");
      } catch (error) {
        console.error("[GoogleCallbackRelay] Callback submission failed:", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "The Google connection could not be completed."
        );
      }
    };

    void submitCallback();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
