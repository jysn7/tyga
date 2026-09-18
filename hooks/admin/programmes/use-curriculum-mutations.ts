import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useTagSessionCurriculum() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      moduleIds,
    }: {
      sessionId: number
      moduleIds: number[]
    }) => {
      const { error } = await supabase.rpc("admin_tag_session_curriculum", {
        p_session_id: sessionId,
        p_module_ids: moduleIds,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-modules"] })
    },
  })
}

export function useRemoveModuleFromSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      moduleId,
    }: {
      sessionId: number
      moduleId: number
    }) => {
      const { error } = await supabase.rpc("admin_remove_module_from_session", {
        p_session_id: sessionId,
        p_module_id: moduleId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-modules"] })
    },
  })
}
