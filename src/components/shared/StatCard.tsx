"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  /** Stagger animation delay in seconds. */
  delay?: number;
}

/**
 * Animated stat card with icon, value, and description.
 * Replaces the duplicated pattern in ReferralStats and similar dashboards.
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn(className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
