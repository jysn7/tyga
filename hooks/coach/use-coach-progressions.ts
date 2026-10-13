import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ============================================================
// 1. READ HOOKS (useQuery)
// ============================================================

export function useGetMemberProgress(memberId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["member-progress", memberId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_member_progress", {
        p_member_id: memberId,
      })
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!memberId,
  })
}

export function useGetMemberLevelHistory(memberId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["member-level-history", memberId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_member_level_history", {
        p_member_id: memberId,
      })
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!memberId,
  })
}

export function useGetCurriculumModules(levelId?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["curriculum-modules", levelId ?? "all"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "coach_get_curriculum_modules",
        {
          p_level_id: levelId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return data
    },
  })
}

// ============================================================
// 2. WRITE HOOKS — WORKING VERSION (Automated System Logic)
// ============================================================

export function useMarkModuleComplete() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      moduleId: number
      sessionId?: number
      notes?: string
    }) => {
      const { data, error } = await supabase.rpc("coach_mark_module_complete", {
        p_member_id: args.memberId,
        p_module_id: args.moduleId,
        p_session_id: args.sessionId ?? null,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["member-progress", args.memberId] })
    },
  })
}

export function useMarkModuleCompleteBatch() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberIds: number[]
      moduleId: number
      sessionId?: number
    }) => {
      const { data, error } = await supabase.rpc(
        "coach_mark_module_complete_batch",
        {
          p_member_ids: args.memberIds,
          p_module_id: args.moduleId,
          p_session_id: args.sessionId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, args) => {
      args.memberIds.forEach((id) => {
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      })
    },
  })
}

export function useUnmarkModuleComplete() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: { memberId: number; moduleId: number }) => {
      const { error } = await supabase.rpc("coach_unmark_module_complete", {
        p_member_id: args.memberId,
        p_module_id: args.moduleId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["member-progress", args.memberId] })
    },
  })
}

export function useAdvanceMemberLevel() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: { memberId: number; notes?: string }) => {
      const { data, error } = await supabase.rpc("coach_advance_member_level", {
        p_member_id: args.memberId,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["member-progress", args.memberId] })
      qc.invalidateQueries({
        queryKey: ["member-level-history", args.memberId],
      })
    },
  })
}

// ============================================================
// 3. WRITE HOOKS — ALTERNATIVE VERSION (Manual Coach Progression)
// ============================================================

export function useSubmitProgression() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      toLevelId: number
      badgeComplete: boolean
      notes?: string
    }) => {
      const { data, error } = await supabase.rpc("coach_submit_progression", {
        p_member_id: args.memberId,
        p_to_level_id: args.toLevelId,
        p_badge_complete: args.badgeComplete,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["member-progress", args.memberId] })
      qc.invalidateQueries({
        queryKey: ["member-level-history", args.memberId],
      })
    },
  })
}
