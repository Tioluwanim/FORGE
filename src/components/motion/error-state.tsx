"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared "couldn't load X" state. Never a raw status code or stack trace —
 * always a plain sentence, a reassurance that nothing was lost, and a retry.
 */
export function ErrorState({
  message = "Couldn't load this page.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className ?? ""}`}
    >
      <AlertTriangle className="h-5 w-5 text-signal-warn" />
      <p className="max-w-sm text-sm text-text-muted">{message}</p>
      <p className="text-xs text-text-faint">Your progress is safe.</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          Retry
        </Button>
      )}
    </div>
  );
}
