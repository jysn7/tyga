import { createClient } from "@/utils/supabase/client"

export const supabase = createClient()

// ---------- Types ----------

export type AppointmentType = "assessment" | "parent_consultation"

export type AppointmentStatus =
  "requested" | "scheduled" | "completed" | "cancelled" | "no_show"

// ---------- Query keys ----------

export const appointmentQueryKeys = {
  openSlots: (levelId: number | null) =>
    ["appointment-slots", "open", levelId ?? "all"] as const,
  coachSlots: (includeArchived: boolean) =>
    ["appointment-slots", "coach", includeArchived] as const,
  headCoachQueue: (status: AppointmentStatus | null) =>
    ["appointments", "head-coach", status ?? "all"] as const,
  parentAppointments: () => ["appointments", "parent"] as const,
}
