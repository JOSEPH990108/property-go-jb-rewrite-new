"use client";

// src/components/features/appointments/appointment-card.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, Phone } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Appointment } from "@/types/appointment";
import type { ComponentProps } from "react";

type AppointmentStatusTone = NonNullable<ComponentProps<typeof StatusBadge>["tone"]>;

export const APPOINTMENT_STATUS_TONES: Record<string, AppointmentStatusTone> = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "info",
  CANCELLED: "danger",
  NO_SHOW: "warning",
};

const DEFAULT_STATUS_TONE: AppointmentStatusTone = "neutral";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusTone = APPOINTMENT_STATUS_TONES[appointment.status.code] ?? DEFAULT_STATUS_TONE;

  return (
    <Card className="group border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 overflow-hidden backdrop-blur-sm transition-all duration-300">
      <CardContent className="space-y-4 p-5">
        {/* Header: Date & Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary border-primary/20 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border">
              <span className="text-xs font-medium uppercase">
                {format(new Date(appointment.scheduledAt), "MMM")}
              </span>
              <span className="text-xl font-bold">
                {format(new Date(appointment.scheduledAt), "d")}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {format(new Date(appointment.scheduledAt), "EEEE, h:mm a")}
              </p>
              <h3 className="text-foreground line-clamp-1 text-lg font-semibold">
                {appointment.project.name}
              </h3>
            </div>
          </div>
          <StatusBadge
            status={appointment.status.code.toLowerCase()}
            label={appointment.status.name}
            tone={statusTone}
            className="px-2 py-0.5 text-xs whitespace-nowrap"
          />
        </div>

        {/* Location */}
        {appointment.project.address && (
          <div className="text-muted-foreground flex items-start gap-2 pl-1 text-sm">
            <MapPin className="text-primary/70 mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1 text-xs">{appointment.project.address}</span>
          </div>
        )}

        {/* Agent & Actions */}
        <div className="border-border/50 mt-2 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-border h-8 w-8 border">
              <AvatarImage src={appointment.agent?.image ?? undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="text-foreground text-sm font-medium">
                {appointment.agent?.name ?? "Unassigned"}
              </p>
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {appointment.agent?.agencyName ?? "Agent"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {appointment.agent?.phoneNumber && (
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                asChild
              >
                <a
                  href={`https://wa.me/${appointment.agent.phoneNumber.replace(/\+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="bg-muted/30 text-muted-foreground border-border/30 mt-2 rounded-md border p-3 text-xs italic">
            &ldquo;{appointment.notes}&rdquo;
          </div>
        )}
      </CardContent>
    </Card>
  );
}
