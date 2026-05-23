import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationStatusProps {
  valid: boolean;
  message?: string;
  className?: string;
}

/**
 * Inline validation feedback with check/x icon.
 * Replaces the duplicated CheckCircle2/XCircle pattern
 * found in ReferralCodeInput, ReferralCodeCard, BookingForm, etc.
 */
export function ValidationStatus({ valid, message, className }: ValidationStatusProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        valid ? "text-green-600" : "text-destructive",
        className,
      )}
    >
      {valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {message}
    </div>
  );
}
