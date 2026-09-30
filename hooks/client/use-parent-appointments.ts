import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  supabase,
  appointmentQueryKeys,
  type AppointmentStatus,
} from "@/hooks/use-appointment-slots"

// ---------- Types ----------

export type OpenSlot = {
  slotId: number
  startsAt: string
  endsAt: string
  venueId: number
  venueName: string
  levelId: number | null
  levelName: string | null
  coachId: number | null
  coachName: string | null
  capacity: number
  booked: number
  remaining: number
  notes: string | null
}

type OpenSlotRow = {
  slot_id: number
  starts_at: string
  ends_at: string
  venue_id: number
  venue_name: string
  level_id: number | null
  level_name: string | null
  coach_id: number | null
  coach_name: string | null
  capacity: number
  booked: number
  remaining: number
  notes: string | null
}

function toOpenSlot(row: OpenSlotRow): OpenSlot {
  return {
    slotId: row.slot_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venueId: row.venue_id,
    venueName: row.venue_name,
    levelId: row.level_id,
    levelName: row.level_name,
    coachId: row.coach_id,
    coachName: row.coach_name,
    capacity: row.capacity,
    booked: row.booked,
    remaining: row.remaining,
    notes: row.notes,
  }
}

export type ParentAppointment = {
  id: number
  status: AppointmentStatus
  memberId: number
  memberName: string
  venueName: string
  slotStartsAt: string | null
  slotEndsAt: string | null
  scheduledAt: string | null
  levelName: string | null
  coachName: string | null
  requestedAt: string
  notes: string | null
}

type ParentAppointmentRow = {
  id: number
  status: AppointmentStatus
  member_id: number
  member_name: string
  venue_name: string
  slot_starts_at: string | null
  slot_ends_at: string | null
  scheduled_at: string | null
  level_name: string | null
  coach_name: string | null
  requested_at: string
  notes: string | null
}

function toParentAppointment(row: ParentAppointmentRow): ParentAppointment {
  return {
    id: row.id,
    status: row.status,
    memberId: row.member_id,
    memberName: row.member_name,
    venueName: row.venue_name,
    slotStartsAt: row.slot_starts_at,
    slotEndsAt: row.slot_ends_at,
    scheduledAt: row.scheduled_at,
    levelName: row.level_name,
    coachName: row.coach_name,
    requestedAt: row.requested_at,
    notes: row.notes,
  }
}

// ---------- Queries ----------

export function useOpenSlots(
  levelId: number | null = null,
  from?: string,
  to?: string
) {
  return useQuery({
    queryKey: [
      "appointment-slots",
      "open",
      levelId ?? "all",
      from ?? "any",
      to ?? "any",
    ],
    queryFn: async (): Promise<OpenSlot[]> => {
      const { data, error } = await supabase.rpc("parent_get_open_slots", {
        p_level_id: levelId,
        p_from: from ?? null,
        p_to: to ?? null,
      })
      if (error) throw error
      return (data as OpenSlotRow[]).map(toOpenSlot)
    },
  })
}

export function useParentAppointments() {
  return useQuery({
    queryKey: appointmentQueryKeys.parentAppointments(),
    queryFn: async (): Promise<ParentAppointment[]> => {
      const { data, error } = await supabase.rpc("parent_get_own_appointments")
      if (error) throw error
      return (data as ParentAppointmentRow[]).map(toParentAppointment)
    },
  })
}

// ---------- Mutations ----------

export function useBookSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      slotId,
      memberId,
    }: {
      slotId: number
      memberId: number
    }) => {
      const { data, error } = await supabase.rpc("parent_book_slot", {
        p_slot_id: slotId,
        p_member_id: memberId,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      appointmentId,
      reason,
    }: {
      appointmentId: number
      reason?: string
    }) => {
      const { error } = await supabase.rpc("parent_cancel_appointment", {
        p_appointment_id: appointmentId,
        p_reason: reason ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}
