"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="bg-destructive/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            This page encountered an error. Please try again.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
