// src\components\profile\LinkedAccounts.tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Loader2, Check, X } from "lucide-react";
import { getAccountMethods, unlinkGoogleAccount } from "@/app/actions/auth-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useServerQuery } from "@/hooks/useServerQuery";

export function LinkedAccounts() {
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);

  const fetchMethods = useCallback(async () => {
    const res = await getAccountMethods();
    if (res.success && res.methods) {
      return { success: true, data: res.methods };
    }
    return { success: false, error: "Failed to fetch account methods" };
  }, []);

  const {
    data: accountMethods,
    isLoading,
    refetch,
  } = useServerQuery<{
    google: boolean;
    hasPassword: boolean;
    phone: boolean;
  }>(fetchMethods);

  const handleLinkGoogle = async () => {
    setIsLinking(true);
    try {
      const res = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/profile",
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to link Google account");
        setIsLinking(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
      setIsLinking(false);
    }
  };

  const handleDisconnectClick = () => {
    const hasOtherMethods = accountMethods?.hasPassword || accountMethods?.phone;

    if (!hasOtherMethods) {
      toast.error(
        "You cannot disconnect your only login method. Please add a password or verified phone number first, or delete your account.",
        {
          duration: 5000,
        },
      );
      return;
    }

    setShowUnlinkModal(true);
  };

  const confirmUnlink = async () => {
    setIsUnlinking(true);
    try {
      const res = await unlinkGoogleAccount();
      if (res.success) {
        toast.success("Google account disconnected successfully");
        await refetch();
        setShowUnlinkModal(false);
      } else {
        toast.error(res.error || "Failed to disconnect Google account");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUnlinking(false);
    }
  };

  const isGoogleLinked = accountMethods?.google ?? false;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Linked Accounts</h3>

      {/* GOOGLE LINK */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <span className="text-muted-foreground font-bold">G</span>
          </div>
          <div>
            <p className="font-medium">Google</p>
            <p className="text-muted-foreground text-sm">
              {isGoogleLinked
                ? "Your Google account is connected."
                : "Link your Google account for easier login"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <Button variant="ghost" disabled size="icon">
            <Loader2 className="h-4 w-4 animate-spin" />
          </Button>
        ) : (
          <Button
            variant={isGoogleLinked ? "secondary" : "outline"}
            onClick={isGoogleLinked ? handleDisconnectClick : handleLinkGoogle}
            disabled={isLinking || isUnlinking}
            className={
              isGoogleLinked
                ? "group hover:bg-destructive hover:text-destructive-foreground relative overflow-hidden transition-colors"
                : ""
            }
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : isUnlinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : isGoogleLinked ? (
              <>
                <span className="flex items-center group-hover:hidden">
                  <Check className="mr-2 h-4 w-4" />
                  Connected
                </span>
                <span className="hidden items-center group-hover:flex">
                  <X className="mr-2 h-4 w-4" />
                  Disconnect
                </span>
              </>
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </div>

      {/* Unlink Confirmation Modal */}
      <ConfirmDialog
        open={showUnlinkModal}
        onOpenChange={setShowUnlinkModal}
        title="Disconnect Google Account"
        description="Are you sure you want to disconnect your Google account? You will need to use your phone number or password to log in next time."
        onConfirm={confirmUnlink}
        isLoading={isUnlinking}
        confirmLabel="Disconnect"
        variant="destructive"
      />
    </div>
  );
}
