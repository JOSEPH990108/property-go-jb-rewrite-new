"use client";

import { Appointment } from "@/types/appointment";
import { format, isSameDay } from "date-fns";
import { AppointmentCard } from "./appointment-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaViewProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onClearSelection: () => void;
  className?: string;
}

export function AgendaView({
  appointments,
  selectedDate,
  onClearSelection,
  className,
}: AgendaViewProps) {
  const filtered = selectedDate
    ? appointments.filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate))
    : appointments;

  const groupTitle = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy")
    : "Upcoming Appointments";

  return (
    <div className={cn("flex h-full flex-col space-y-6", className)}>
      <div className="border-border/50 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            {selectedDate ? "Day Agenda" : "All Appointments"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{groupTitle}</p>
        </div>
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary gap-2 transition-colors"
          >
            <FilterX className="h-4 w-4" /> Show All
          </Button>
        )}
      </div>

      <ScrollArea className="-mr-4 h-[calc(100vh-300px)] min-h-[400px] flex-1 pr-4">
        <div className="space-y-4 pb-20">
          {filtered.length === 0 ? (
            <div className="border-border/50 bg-card/10 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-20 text-center">
              <div className="bg-muted/50 text-muted-foreground rounded-full p-4">
                <X className="h-8 w-8 opacity-50" />
              </div>
              <div>
                <h3 className="text-foreground font-medium">No appointments scheduled</h3>
                <p className="text-muted-foreground text-sm">You are free on this day.</p>
              </div>
              <Button variant="outline" onClick={onClearSelection}>
                View All Upcoming
              </Button>
            </div>
          ) : (
            filtered.map((app) => <AppointmentCard key={app.id} appointment={app} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
