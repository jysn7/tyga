import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type RolloverInput = {
  sourceProgrammeId: number
  newName: string
  newTermStart: string
  newTermEnd: string
  carryOverEnrolments: boolean
  copyCoaches: boolean
  notifyParents: boolean
}

export type RolloverResult = {
  newProgrammeId: number
  carriedEnrolments: number
  copiedCoaches: number
}

export function useRolloverProgramme() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: RolloverInput): Promise<RolloverResult> => {
      const supabase = createClient()

      const { data, error } = await supabase.rpc("admin_rollover_programme", {
        p_source_programme_id: input.sourceProgrammeId,
        p_new_name: input.newName,
        p_new_term_start: input.newTermStart,
        p_new_term_end: input.newTermEnd,
        p_carry_over_enrolments: input.carryOverEnrolments,
        p_copy_coaches: input.copyCoaches,
      })
      if (error) throw new Error(error.message)

      if (input.notifyParents) {
        const { error: notifyError } = await supabase.rpc(
          "admin_notify_rollover",
          { p_programme_id: data.new_programme_id }
        )
        if (notifyError) {
          // Don't fail the whole rollover if notification fails
          console.error("Notification failed:", notifyError.message)
        }
      }

      return {
        newProgrammeId: data.new_programme_id,
        carriedEnrolments: data.carried_enrolments,
        copiedCoaches: data.copied_coaches,
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-programmes"] })
      qc.invalidateQueries({ queryKey: ["admin-programme"] })
    },
  })
}
