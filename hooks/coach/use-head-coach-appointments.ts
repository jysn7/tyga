import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  supabase,
  appointmentQueryKeys,
  type AppointmentStatus,
} from "./use-appointment-slots"

// ---------- Types ----------

export type HeadCoachAppointment = {
  id: number
  status: AppointmentStatus
  memberId: number
  memberName: string
  venueId: number
  venueName: string
  slotStartsAt: string | null
  slotEndsAt: string | null
  levelId: number | null
  levelName: string | null
  coachId: number | null
  coachName: string | null
  requestedAt: string
  scheduledAt: string | null
  notes: string | null
}

type HeadCoachAppointmentRow = {
  id: number
  status: AppointmentStatus
  member_id: number
  member_name: string
  venue_id: number
  venue_name: string
  slot_starts_at: string | null
  slot_ends_at: string | null
  level_id: number | null
  level_name: string | null
  coach_id: number | null
  coach_name: string | null
  requested_at: string
  scheduled_at: string | null
  notes: string | null
}

function toHeadCoachAppointment(
  row: HeadCoachAppointmentRow
): HeadCoachAppointment {
  return {
    id: row.id,
    status: row.status,
    memberId: row.member_id,
    memberName: row.member_name,
    venueId: row.venue_id,
    venueName: row.venue_name,
    slotStartsAt: row.slot_starts_at,
    slotEndsAt: row.slot_ends_at,
    levelId: row.level_id,
    levelName: row.level_name,
    coachId: row.coach_id,
    coachName: row.coach_name,
    requestedAt: row.requested_at,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
  }
}

// ---------- Queries ----------

export function useHeadCoachAppointments(
  status: AppointmentStatus | null = null
) {
  return useQuery({
    queryKey: appointmentQueryKeys.headCoachQueue(status),
    queryFn: async (): Promise<HeadCoachAppointment[]> => {
      const { data, error } = await supabase.rpc(
        "head_coach_get_appointments",
        { p_status: status }
      )
      if (error) throw error
      return (data as HeadCoachAppointmentRow[]).map(toHeadCoachAppointment)
    },
  })
}

// ---------- Mutations ----------

export function useConfirmAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      appointmentId,
      scheduledAt,
      notes,
    }: {
      appointmentId: number
      scheduledAt: string
      notes?: string
    }) => {
      const { error } = await supabase.rpc("head_coach_confirm_appointment", {
        p_appointment_id: appointmentId,
        p_scheduled_at: scheduledAt,
        p_notes: notes ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      appointmentId,
      assessedLevelId,
      notes,
    }: {
      appointmentId: number
      assessedLevelId?: number | null
      notes?: string
    }) => {
      const { error } = await supabase.rpc("head_coach_complete_appointment", {
        p_appointment_id: appointmentId,
        p_assessed_level_id: assessedLevelId ?? null,
        p_notes: notes ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useMarkNoShow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: number) => {
      const { error } = await supabase.rpc("head_coach_mark_no_show", {
        p_appointment_id: appointmentId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}
