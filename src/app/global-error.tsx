"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to external error monitoring service (Sentry, etc.)
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-6 text-center">
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-muted-foreground font-mono text-xs">Error ID: {error.digest}</p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
