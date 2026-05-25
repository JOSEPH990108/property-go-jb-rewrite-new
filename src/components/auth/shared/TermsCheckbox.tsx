"use client";

// src/components/auth/shared/TermsCheckbox.tsx
// Reusable Terms of Service acceptance checkbox.
// Used by both SignInForm and SignUpForm.

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TermsCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  requiredError?: string | null;
}

export function TermsCheckbox({
  id,
  checked,
  onCheckedChange,
  description = "You must accept our terms and conditions to proceed.",
  requiredError = null,
}: TermsCheckboxProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const termsContainerRef = useRef<HTMLDivElement | null>(null);

  // Callback ref: fires when the scrollable div actually mounts inside the dialog.
  // At that point we can reliably measure whether the content overflows.
  const termsRefCallback = useCallback((node: HTMLDivElement | null) => {
    termsContainerRef.current = node;
    if (!node) return;

    node.scrollTop = 0;
    // rAF ensures the browser has finished layout so measurements are accurate.
    requestAnimationFrame(() => {
      if (node.scrollHeight <= node.clientHeight + 8) {
        setHasReachedEnd(true);
      } else {
        setHasReachedEnd(false);
      }
    });
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setHasReachedEnd(false);
  };

  const handleTermsScroll = () => {
    const container = termsContainerRef.current;
    if (!container || hasReachedEnd) return;

    const reachedEnd = container.scrollTop + container.clientHeight >= container.scrollHeight - 8;
    if (reachedEnd) setHasReachedEnd(true);
  };

  const handleCheckboxChange = (nextValue: boolean) => {
    if (!nextValue) {
      onCheckedChange(false);
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirmTerms = () => {
    onCheckedChange(true);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="bg-muted/30 border-border/50 flex items-start gap-2 rounded-lg border p-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => handleCheckboxChange(value as boolean)}
          className="mt-0.5"
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor={id} className="cursor-pointer text-sm leading-none font-medium">
            I agree to the Terms of Service and Privacy Policy
          </Label>
          <p className="text-muted-foreground text-xs">{description}</p>
          {requiredError && <p className="text-destructive text-xs">{requiredError}</p>}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please review all terms. The confirmation button will be enabled once you reach the
              end.
            </DialogDescription>
          </DialogHeader>

          <div
            ref={termsRefCallback}
            aria-label="Terms content"
            onScroll={handleTermsScroll}
            className="border-border/60 bg-background/40 text-muted-foreground max-h-[45vh] space-y-4 overflow-y-auto rounded-md border p-4 text-sm"
          >
            <p>
              1. Service Scope: This platform provides property listing, comparison, and
              communication tools. We may update, suspend, or discontinue features with reasonable
              notice.
            </p>
            <p>
              2. Account Responsibility: You are responsible for all activities under your account
              and for keeping your login access secure. You must provide accurate and current
              information.
            </p>
            <p>
              3. Acceptable Use: You agree not to misuse the service, attempt unauthorized access,
              scrape private data, or interfere with normal platform operations.
            </p>
            <p>
              4. Privacy and Data: We process personal data in accordance with our privacy policy.
              By proceeding, you consent to data collection and processing needed to provide the
              service.
            </p>
            <p>
              5. Communication Consent: You consent to receiving authentication, account, and
              transactional messages through supported channels such as SMS or email.
            </p>
            <p>
              6. Limitation of Liability: To the extent permitted by law, the platform is provided
              on an as-is basis and we are not liable for indirect, incidental, or consequential
              losses.
            </p>
            <p>
              7. Changes to Terms: We may update these terms periodically. Continued use of the
              platform after updates indicates acceptance of the revised terms.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmTerms} disabled={!hasReachedEnd}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
