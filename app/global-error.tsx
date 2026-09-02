"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-white px-6 text-neutral-950">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold">The application couldn&apos;t start</h1>
            <p className="text-sm text-neutral-600">
              Please retry. If the problem continues, refresh the page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
