"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/actions/favorite-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  projectId: string;
  initialIsFavorite: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({
  projectId,
  initialIsFavorite,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleFavorite(projectId);
      if (result.success) {
        setIsFavorite(result.data.isFavorite);
        toast.success(result.data.isFavorite ? "Saved to favorites" : "Removed from favorites");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={cn("gap-2", className)}
      >
        <Heart
          className={cn("h-4 w-4 transition-colors", isFavorite && "fill-red-500 text-red-500")}
        />
        {isFavorite ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "rounded-full p-2 transition-all hover:scale-110",
        isFavorite ? "bg-red-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60",
        isPending && "opacity-50",
        className,
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart className={cn("h-5 w-5 transition-all", isFavorite && "fill-white")} />
    </button>
  );
}
