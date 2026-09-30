import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

// --- QUERIES ---

export function useGetSessionModules(sessionId: number) {
  return useQuery({
    queryKey: ["admin-session-modules", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_session_modules", {
        p_session_id: sessionId,
      })
      if (error) throw error
      return data
    },
    enabled: !!sessionId,
  })
}

export function useGetAllCurriculumModules() {
  return useQuery({
    queryKey: ["admin-all-curriculum-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "admin_get_all_curriculum_modules"
      )
      if (error) throw error
      return data
    },
  })
}

// --- MUTATIONS ---

export function useTagSessionCurriculum() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-session-modules", variables.sessionId],
      })
      // FIX: also refresh the sessions list so any summary/count that
      // depends on curriculum tagging stays consistent.
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}

// FIX: new hook for the additive companion function added to the SQL
// (admin_add_modules_to_session). Remove this hook if you dropped that
// SQL function in favour of pure replace semantics.
export function useAddModulesToSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      moduleIds,
    }: {
      sessionId: number
      moduleIds: number[]
    }) => {
      const { error } = await supabase.rpc("admin_add_modules_to_session", {
        p_session_id: sessionId,
        p_module_ids: moduleIds,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-session-modules", variables.sessionId],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}

export function useRemoveModuleFromSession() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-session-modules", variables.sessionId],
      })
      // FIX: keep sessions list consistent.
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}
