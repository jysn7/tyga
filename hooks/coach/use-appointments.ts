import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ---------- Types ----------

export type CoachAppointmentKind = "assessment" | "parent_consultation"

export type CoachAppointmentStatus =
  | "requested"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"

// camelCase: what the components use
export type CoachAppointmentItem = {
  id: number
  type: CoachAppointmentKind
  status: CoachAppointmentStatus
  memberId: number
  memberName: string
  memberAge: number
  reportedSkillLevel: string | null
  venueName: string
  requestedAt: string
  scheduledAt: string | null
  coachId: number | null
  coachName: string | null
  isUnclaimed: boolean
  assessedLevelName: string | null
  notes: string | null
}

// snake_case: exactly what coach_get_appointments() returns
type CoachAppointmentRow = {
  appointment_id: number
  type: CoachAppointmentKind
  status: CoachAppointmentStatus
  member_id: number
  member_name: string
  member_age: number
  reported_skill_level: string | null
  venue_name: string
  requested_at: string
  scheduled_at: string | null
  coach_id: number | null
  coach_name: string | null
  is_unclaimed: boolean
  assessed_level_name: string | null
  notes: string | null
}

function toItem(row: CoachAppointmentRow): CoachAppointmentItem {
  return {
    id: row.appointment_id,
    type: row.type,
    status: row.status,
    memberId: row.member_id,
    memberName: row.member_name,
    memberAge: row.member_age,
    reportedSkillLevel: row.reported_skill_level,
    venueName: row.venue_name,
    requestedAt: row.requested_at,
    scheduledAt: row.scheduled_at,
    coachId: row.coach_id,
    coachName: row.coach_name,
    isUnclaimed: row.is_unclaimed,
    assessedLevelName: row.assessed_level_name,
    notes: row.notes,
  }
}

// ---------- Query ----------

// One hook, called once per tab: "assessment" or "parent_consultation"
export function useCoachAppointmentList(kind: CoachAppointmentKind) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-appointments", kind],
    queryFn: async (): Promise<CoachAppointmentItem[]> => {
      const { data, error } = await supabase.rpc("coach_get_appointments", {
        p_type: kind,
      })
      if (error) throw new Error(error.message)
      return ((data ?? []) as CoachAppointmentRow[]).map(toItem)
    },
  })
}
