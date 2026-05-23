"use client";

import { CalendarSearch, Sparkles } from "lucide-react";
import { generateDemoAppointments } from "@/app/actions/appointment-actions";
import { useRouter } from "next/navigation";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { EmptyState as EmptyStateBase } from "@/components/shared/EmptyState";

export function EmptyState() {
  const router = useRouter();

  const { execute, isLoading } = useAsyncAction(generateDemoAppointments, {
    successMessage: "Demo appointments generated!",
    onSuccess: () => router.refresh(),
  });

  return (
    <EmptyStateBase
      icon={CalendarSearch}
      title="Your Calendar is Clear"
      description="You haven't scheduled any property viewings yet. Browse our exclusive collections or generate a demo schedule to see how it works."
      action={{
        label: "Generate Demo Schedule",
        onClick: () => execute(),
        icon: Sparkles,
        isLoading,
        loadingLabel: "Generating Experience...",
      }}
    />
  );
}
