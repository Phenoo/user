"use client";

import { useEffect, useRef } from "react";

export default function GoogleCallbackPage() {
  const hasSubmitted = useRef(false);

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

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/integrations/google/callback";
    form.hidden = true;

    callbackParams.set("oauth_relay", "1");
    for (const [name, value] of callbackParams.entries()) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          Completing your Google connection…
        </p>
      </div>
    </main>
  );
}
