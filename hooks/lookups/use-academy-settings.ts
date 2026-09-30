import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export type AcademySettings = {
  bookingLeadHours: number
  bookingLookaheadDays: number
  defaultSlotMinutes: number
  cancellationCutoffHours: number
}

type AcademySettingsRow = {
  booking_lead_hours: number
  booking_lookahead_days: number
  default_slot_minutes: number
  cancellation_cutoff_hours: number
}

export function useAcademySettings() {
  return useQuery({
    queryKey: ["lookups", "academy-settings"],
    queryFn: async (): Promise<AcademySettings> => {
      const { data, error } = await supabase
        .from("academy_settings")
        .select(
          "booking_lead_hours, booking_lookahead_days, default_slot_minutes, cancellation_cutoff_hours"
        )
        .eq("id", 1)
        .single()
      if (error) throw error
      const row = data as AcademySettingsRow
      return {
        bookingLeadHours: row.booking_lead_hours,
        bookingLookaheadDays: row.booking_lookahead_days,
        defaultSlotMinutes: row.default_slot_minutes,
        cancellationCutoffHours: row.cancellation_cutoff_hours,
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateAcademySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      bookingLeadHours?: number
      bookingLookaheadDays?: number
      defaultSlotMinutes?: number
      cancellationCutoffHours?: number
    }) => {
      const patch: Record<string, number | string> = {
        updated_at: new Date().toISOString(),
      }
      if (input.bookingLeadHours !== undefined)
        patch.booking_lead_hours = input.bookingLeadHours
      if (input.bookingLookaheadDays !== undefined)
        patch.booking_lookahead_days = input.bookingLookaheadDays
      if (input.defaultSlotMinutes !== undefined)
        patch.default_slot_minutes = input.defaultSlotMinutes
      if (input.cancellationCutoffHours !== undefined)
        patch.cancellation_cutoff_hours = input.cancellationCutoffHours

      const { error } = await supabase
        .from("academy_settings")
        .update(patch)
        .eq("id", 1)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lookups", "academy-settings"],
      })
    },
  })
}
