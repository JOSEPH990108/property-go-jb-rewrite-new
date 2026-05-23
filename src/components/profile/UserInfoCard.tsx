// src\components\profile\UserInfoCard.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { BaseCard } from "@/components/shared/base-card";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/app/actions/profile-actions";
import { Edit2 } from "lucide-react";
import { LinkedAccounts } from "./LinkedAccounts";
import { PhoneVerificationModal } from "./PhoneVerificationModal";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  // PhoneNumber is handled separately via modal for verification
});

interface UserInfoCardProps {
  user: {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await updateProfile({
        name: values.name,
        // phoneNumber: values.phoneNumber, // Phone updated via separate modal
        nationality: null,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseCard
      className="h-full"
      title="Personal Information"
      titleClassName="text-xl font-bold"
      description="Manage your personal details and linked accounts"
      contentClassName="space-y-6 pt-4"
      action={
        <FormDialog
          open={open}
          onOpenChange={setOpen}
          title="Edit Profile"
          description="Make changes to your name here. Phone and Email are managed separately."
          onSubmit={form.handleSubmit(onSubmit)}
          isLoading={isLoading}
          submitLabel="Save changes"
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Edit2 className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit Details</span>
            </Button>
          }
        >
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <FormLabel>Email</FormLabel>
              <Input value={user.email || ""} disabled readOnly className="bg-muted" />
              <p className="text-muted-foreground text-[0.8rem]">
                Email cannot be changed directly.
              </p>
            </div>
          </Form>
        </FormDialog>
      }
    >
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">Name</p>
          <p className="text-sm font-semibold">{user.name || "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">Email</p>
          <p className="text-sm font-semibold break-all">{user.email || "Not set"}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">Phone Number</p>
          <PhoneVerificationModal
            currentPhoneNumber={user.phoneNumber}
            onSuccess={() => {
              router.refresh();
            }}
          />
        </div>
        <p className="text-sm font-semibold">{user.phoneNumber || "Not set"}</p>
      </div>

      {/* Linked Accounts Section */}
      <div className="border-t pt-4">
        <LinkedAccounts />
      </div>
    </BaseCard>
  );
}
