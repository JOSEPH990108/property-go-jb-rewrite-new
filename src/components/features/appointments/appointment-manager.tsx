"use client";

import { useState } from "react";
import { Appointment } from "@/types/appointment";
import { CalendarView } from "./calendar-view";
import { AgendaView } from "./agenda-view";
import { EmptyState } from "./empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List } from "lucide-react";

interface AppointmentManagerProps {
  initialAppointments: Appointment[];
}

export function AppointmentManager({ initialAppointments }: AppointmentManagerProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Check if empty
  if (!initialAppointments || initialAppointments.length === 0) {
    return <EmptyState />;
  }

  // Determine highlighted dates
  const highlightedDates = initialAppointments.map((a) => new Date(a.scheduledAt));

  const handleDateSelect = (newDate: Date | undefined) => {
    // Toggle if same date selected
    if (date && newDate && date.getTime() === newDate.getTime()) {
      setDate(undefined);
    } else {
      setDate(newDate);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Desktop Layout */}
      <div className="hidden grid-cols-12 items-start gap-8 lg:grid">
        <div className="sticky top-24 col-span-4 xl:col-span-3">
          <CalendarView
            date={date}
            setDate={handleDateSelect}
            highlightedDates={highlightedDates}
          />
        </div>
        <div className="col-span-8 xl:col-span-9">
          <AgendaView
            appointments={initialAppointments}
            selectedDate={date}
            onClearSelection={() => setDate(undefined)}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex h-full flex-col lg:hidden">
        <Tabs defaultValue="agenda" className="flex w-full flex-1 flex-col">
          <TabsList className="bg-background/95 sticky top-20 z-10 mb-6 grid w-full grid-cols-2 shadow-sm backdrop-blur">
            <TabsTrigger value="agenda" className="gap-2">
              <List className="h-4 w-4" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" /> Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-0 flex-1">
            <AgendaView
              appointments={initialAppointments}
              selectedDate={date}
              onClearSelection={() => setDate(undefined)}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="bg-card border-border/50 rounded-xl border p-4 shadow-sm">
              <CalendarView
                date={date}
                setDate={handleDateSelect}
                highlightedDates={highlightedDates}
                className="border-0 bg-transparent shadow-none"
              />
            </div>
            <div className="mt-6 px-4">
              <h3 className="mb-2 font-semibold">Selected Date</h3>
              {date ? (
                <AgendaView
                  appointments={initialAppointments}
                  selectedDate={date}
                  onClearSelection={() => setDate(undefined)}
                  className="border-border/50 border-t pt-4"
                />
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Select a date above to see appointments.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
