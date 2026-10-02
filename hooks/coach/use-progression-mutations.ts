import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useSubmitProgression() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      memberId: number
      toLevelId: number
      badgeComplete: boolean
      notes: string | null
    }) => {
      const { data, error } = await supabase.rpc("coach_submit_progression", {
        p_member_id: input.memberId,
        p_to_level_id: input.toLevelId,
        p_badge_complete: input.badgeComplete,
        p_notes: input.notes,
      })
      if (error) throw new Error(error.message)
      return data as number // the new level_progressions id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
    },
  })
}
