// hooks/admin/use-update-coach.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type UpdateCoachInput = {
  coachId: number
  coachType?: "head_coach" | "assistant_coach" | "volunteer"
  maxStudentRatio?: number
}

export function useUpdateCoach() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: UpdateCoachInput) => {
      const { error } = await supabase.rpc("admin_update_coach", {
        p_coach_id: input.coachId,
        p_coach_type: input.coachType ?? null,
        p_max_student_ratio: input.maxStudentRatio ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] })
    },
  })
}
