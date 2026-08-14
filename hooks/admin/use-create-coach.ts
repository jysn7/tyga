import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CreateCoachInput = {
  accountId: string
  coachType?: "head_coach" | "assistant_coach" | "volunteer"
  maxStudentRatio?: number
}

export function useCreateCoach() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: CreateCoachInput) => {
      // Promote the account to 'coach' role first (per the SQL comment on
      // admin_create_coach — it only creates the coaches row, not the role).
      const { error: roleError } = await supabase.rpc(
        "admin_set_account_role",
        {
          p_account_id: input.accountId,
          p_role: "coach",
        }
      )
      if (roleError) throw roleError

      const { data, error } = await supabase.rpc("admin_create_coach", {
        p_account_id: input.accountId,
        p_coach_type: input.coachType ?? null,
        p_max_student_ratio: input.maxStudentRatio ?? null,
      })
      if (error) throw error

      return data as number // new coach id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] })
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] })
    },
  })
}
