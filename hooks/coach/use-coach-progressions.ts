import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useCoachMemberLevelCompletion(
  memberId: number,
  enabled: boolean
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-member-level-completion", memberId],
    enabled: enabled && memberId > 0,
    staleTime: 30_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("member_is_level_complete", {
        p_member_id: memberId,
      })
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useCoachSetModuleCompletion() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      moduleId: number
      completed: boolean
    }) => {
      const { error } = await supabase.rpc(
        args.completed
          ? "coach_complete_module_for_enrolled"
          : "coach_uncomplete_module_for_enrolled",
        args.completed
          ? {
              p_member_id: args.memberId,
              p_module_id: args.moduleId,
              p_notes: null,
            }
          : {
              p_member_id: args.memberId,
              p_module_id: args.moduleId,
            }
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-progression-overview"],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-member-level-completion", args.memberId],
      })
    },
  })
}

export function useCoachAdvanceMemberLevel() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      badgeComplete: boolean
      notes: string
    }) => {
      const { data, error } = await supabase.rpc("coach_advance_member_level", {
        p_member_id: args.memberId,
        p_badge_complete: args.badgeComplete,
        p_notes: args.notes.trim() || null,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-progression-overview"],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-member-level-completion", args.memberId],
      })
    },
  })
}
