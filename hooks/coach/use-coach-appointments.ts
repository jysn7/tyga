import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  supabase,
  appointmentQueryKeys,
  type AppointmentType,
  type AppointmentStatus,
} from "./use-appointment-slots"

// ---------- Types ----------

export type CoachSlot = {
  id: number
  startsAt: string
  endsAt: string
  venueId: number
  venueName: string
  levelId: number | null
  levelName: string | null
  capacity: number
  booked: number
  remaining: number
  archivedAt: string | null
}

type CoachSlotRow = {
  id: number
  starts_at: string
  ends_at: string
  venue_id: number
  venue_name: string
  level_id: number | null
  level_name: string | null
  capacity: number
  booked: number
  remaining: number
  archived_at: string | null
}

function toCoachSlot(row: CoachSlotRow): CoachSlot {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venueId: row.venue_id,
    venueName: row.venue_name,
    levelId: row.level_id,
    levelName: row.level_name,
    capacity: row.capacity,
    booked: row.booked,
    remaining: row.remaining,
    archivedAt: row.archived_at,
  }
}

export type CoachBookedAppointment = {
  id: number
  status: AppointmentStatus
  memberId: number
  memberName: string
  venueName: string
  slotStartsAt: string | null
  slotEndsAt: string | null
  levelId: number | null
  levelName: string | null
  requestedAt: string
  scheduledAt: string | null
  notes: string | null
}

type CoachBookedAppointmentRow = {
  id: number
  status: AppointmentStatus
  member_id: number
  member_name: string
  venue_name: string
  slot_starts_at: string | null
  slot_ends_at: string | null
  level_id: number | null
  level_name: string | null
  requested_at: string
  scheduled_at: string | null
  notes: string | null
}

function toCoachBookedAppointment(
  row: CoachBookedAppointmentRow
): CoachBookedAppointment {
  return {
    id: row.id,
    status: row.status,
    memberId: row.member_id,
    memberName: row.member_name,
    venueName: row.venue_name,
    slotStartsAt: row.slot_starts_at,
    slotEndsAt: row.slot_ends_at,
    levelId: row.level_id,
    levelName: row.level_name,
    requestedAt: row.requested_at,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
  }
}

// ---------- Queries ----------

export function useCoachSlots(includeArchived = false) {
  return useQuery({
    queryKey: appointmentQueryKeys.coachSlots(includeArchived),
    queryFn: async (): Promise<CoachSlot[]> => {
      const { data, error } = await supabase.rpc("coach_get_own_slots", {
        p_from: null,
        p_to: null,
        p_include_archived: includeArchived,
      })
      if (error) throw error
      return (data as CoachSlotRow[]).map(toCoachSlot)
    },
  })
}

export function useCoachBookedAppointments(
  status: AppointmentStatus | null = null
) {
  return useQuery({
    queryKey: ["appointments", "coach", status ?? "all"],
    queryFn: async (): Promise<CoachBookedAppointment[]> => {
      const { data, error } = await supabase.rpc(
        "coach_get_booked_appointments",
        { p_status: status }
      )
      if (error) throw error
      return (data as CoachBookedAppointmentRow[]).map(toCoachBookedAppointment)
    },
  })
}

// ---------- Mutations ----------

export function useOpenAppointmentSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venueId: number
      startsAt: string
      endsAt: string
      levelId?: number | null
      type?: AppointmentType
      capacity?: number
      notes?: string | null
    }) => {
      const { data, error } = await supabase.rpc(
        "coach_open_appointment_slot",
        {
          p_venue_id: input.venueId,
          p_starts_at: input.startsAt,
          p_ends_at: input.endsAt,
          p_level_id: input.levelId ?? null,
          p_type: input.type ?? "assessment",
          p_capacity: input.capacity ?? 1,
          p_notes: input.notes ?? null,
        }
      )
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}

export function useArchiveAppointmentSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (slotId: number) => {
      const { error } = await supabase.rpc("coach_archive_appointment_slot", {
        p_slot_id: slotId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}

export function useIsHeadCoach() {
  return useQuery({
    queryKey: ["coaches", "me", "is-head"],
    queryFn: async (): Promise<boolean> => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user?.id
      if (!userId) return false

      const { data, error } = await supabase
        .from("coaches")
        .select("coach_type")
        .eq("account_id", userId)
        .maybeSingle()
      if (error) throw error
      return data?.coach_type === "head_coach"
    },
    staleTime: 5 * 60 * 1000,
  })
}
