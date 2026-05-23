// src\components\profile\DeleteAccountCard.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/app/actions/auth-actions";
import { BaseCard } from "@/components/shared/base-card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/stores/ui-store";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteUserAccount();

      if (res.success) {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              useUIStore.getState().resetDismissed();
              toast.success("Your account has been deleted.");
              router.push("/");
              router.refresh();
            },
          },
        });
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <BaseCard
      className="border-destructive/20 bg-destructive/5"
      title={
        <div className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </div>
      }
      description="Irreversible actions related to your account."
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Delete Account</p>
          <p className="text-muted-foreground text-sm">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
          onConfirm={handleDelete}
          isLoading={isDeleting}
          confirmLabel="Yes, Delete My Account"
          variant="destructive"
          trigger={<Button variant="destructive">Delete Account</Button>}
        />
      </div>
    </BaseCard>
  );
}
