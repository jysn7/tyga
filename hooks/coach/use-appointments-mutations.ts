import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// After any change, tell React Query the cached lists are out of date so
// they reload. The dashboard shows a "pending assessments" count, and an
// assessment can change a member's level, so we refresh those too.
function refreshAppointmentData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["coach-appointments"] })
  queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] })
  queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
}

export function useClaimAssessment() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: number) => {
      const { error } = await supabase.rpc("coach_claim_assessment", {
        p_appointment_id: appointmentId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => refreshAppointmentData(queryClient),
  })
}

export function useRecordAssessment() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      appointmentId: number
      assessedLevelId: number
      notes: string | null
    }) => {
      const { error } = await supabase.rpc("coach_record_assessment", {
        p_appointment_id: input.appointmentId,
        p_assessed_level_id: input.assessedLevelId,
        p_notes: input.notes,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => refreshAppointmentData(queryClient),
  })
}

export function useRecordConsultation() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { appointmentId: number; notes: string | null }) => {
      const { error } = await supabase.rpc("coach_record_parent_consultation", {
        p_appointment_id: input.appointmentId,
        p_notes: input.notes,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => refreshAppointmentData(queryClient),
  })
}
