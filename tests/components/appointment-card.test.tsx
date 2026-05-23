import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentCard } from "@/components/features/appointments/appointment-card";
import type { Appointment } from "@/types/appointment";

const appointment = {
  id: "appointment-1",
  userId: "user-1",
  projectId: "project-1",
  scheduledAt: "2026-01-12T02:30:00.000Z",
  statusId: "status-1",
  notes: "Bring booking documents.",
  project: {
    id: "project-1",
    name: "Vistara Hills",
    slug: "vistara-hills",
    address: "Jalan Example, Johor Bahru",
  },
  status: {
    id: "status-1",
    code: "CONFIRMED",
    name: "Confirmed",
  },
  agent: {
    id: "agent-1",
    name: "Sarah Tan",
    phoneNumber: "+60123456789",
    agencyName: "Prime Realty",
  },
} as Appointment;

describe("AppointmentCard", () => {
  it("renders appointment details with a shared status badge", () => {
    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText("Vistara Hills")).toBeTruthy();
    expect(screen.getByText("Confirmed")).toBeTruthy();
    expect(screen.getByText("Sarah Tan")).toBeTruthy();
    expect(screen.getByText(/Bring booking documents/i)).toBeTruthy();
  });
});
