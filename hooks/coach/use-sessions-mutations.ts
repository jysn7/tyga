// ============================================================
// Milestones — tick / untick modules for a student
// ============================================================
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useMarkModuleComplete() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      moduleId: number
      sessionId?: number | null
      notes?: string | null
    }): Promise<{ alreadyCompleted: boolean; levelNowComplete: boolean }> => {
      const { data, error } = await supabase.rpc("coach_mark_module_complete", {
        p_member_id: args.memberId,
        p_module_id: args.moduleId,
        p_session_id: args.sessionId ?? null,
        p_notes: args.notes?.trim() || null,
      })
      if (error) throw new Error(error.message)
      const r = (Array.isArray(data) ? data[0] : data) as {
        already_completed: boolean
        level_now_complete: boolean
      }
      return {
        alreadyCompleted: !!r?.already_completed,
        levelNowComplete: !!r?.level_now_complete,
      }
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["member-progress", args.memberId] })
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
      if (args.sessionId != null) {
        qc.invalidateQueries({
          queryKey: ["milestone-picker", args.sessionId],
        })
      }
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
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["milestone-picker"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// Batch variant: same module for many students in one session.
export function useMarkModuleCompleteBatch() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberIds: number[]
      moduleId: number
      sessionId?: number | null
    }): Promise<
      {
        memberId: number
        alreadyCompleted: boolean
        levelNowComplete: boolean
      }[]
    > => {
      const { data, error } = await supabase.rpc(
        "coach_mark_module_complete_batch",
        {
          p_member_ids: args.memberIds,
          p_module_id: args.moduleId,
          p_session_id: args.sessionId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return (
        (data ?? []) as Array<{
          member_id: number
          already_completed: boolean
          level_now_complete: boolean
        }>
      ).map((r) => ({
        memberId: r.member_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_data, args) => {
      args.memberIds.forEach((id) =>
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["milestone-picker"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// Bulk ticks: arbitrary (member, module) pairs. Used by the matrix grid.
export function useMarkModulesBulk() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      marks: { memberId: number; moduleId: number }[]
      sessionId?: number | null
    }): Promise<
      {
        memberId: number
        moduleId: number
        alreadyCompleted: boolean
        levelNowComplete: boolean
      }[]
    > => {
      const payload = args.marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await supabase.rpc("coach_mark_modules_bulk", {
        p_marks: payload,
        p_session_id: args.sessionId ?? null,
      })
      if (error) throw new Error(error.message)
      return (
        (data ?? []) as Array<{
          member_id: number
          module_id: number
          already_completed: boolean
          level_now_complete: boolean
        }>
      ).map((r) => ({
        memberId: r.member_id,
        moduleId: r.module_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_data, args) => {
      const touchedMembers = new Set(args.marks.map((m) => m.memberId))
      touchedMembers.forEach((id) =>
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["milestone-picker"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

export function useUnmarkModulesBulk() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      marks: { memberId: number; moduleId: number }[]
    }): Promise<number> => {
      const payload = args.marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await supabase.rpc("coach_unmark_modules_bulk", {
        p_marks: payload,
      })
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: (_data, args) => {
      const touchedMembers = new Set(args.marks.map((m) => m.memberId))
      touchedMembers.forEach((id) =>
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["milestone-picker"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}
