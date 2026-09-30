import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { AppointmentType } from "@/hooks/use-appointment-slots"

const supabase = createClient()

export function useAdminCreateSlotForCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      coachId: number
      venueId: number
      startsAt: string
      endsAt: string
      levelId?: number | null
      type?: AppointmentType
      capacity?: number
      notes?: string | null
    }) => {
      const { data, error } = await supabase.rpc(
        "admin_create_slot_for_coach",
        {
          p_coach_id: input.coachId,
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

export function useAdminBookSlotForMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { slotId: number; memberId: number }) => {
      const { data, error } = await supabase.rpc("admin_book_slot_for_member", {
        p_slot_id: input.slotId,
        p_member_id: input.memberId,
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

export function useAdminConfirmAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      appointmentId: number
      coachId: number
      scheduledAt: string
      notes?: string
    }) => {
      const { error } = await supabase.rpc("admin_confirm_appointment", {
        p_appointment_id: input.appointmentId,
        p_coach_id: input.coachId,
        p_scheduled_at: input.scheduledAt,
        p_notes: input.notes ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}
