import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// Attendance
// ============================================================

export function useMarkAttendance() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      memberId,
      status,
    }: {
      sessionId: number
      memberId: number
      status: "present" | "absent" | "late" | "excused"
    }) => {
      const { error } = await supabase.rpc("coach_mark_attendance", {
        p_session_id: sessionId,
        p_member_id: memberId,
        p_status: status,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-roster", sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", sessionId],
      })
    },
  })
}

export function useBulkMarkAttendance() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      status,
    }: {
      sessionId: number
      status: "present" | "absent" | "late" | "excused"
    }): Promise<number> => {
      const { data, error } = await supabase.rpc("coach_bulk_mark_attendance", {
        p_session_id: sessionId,
        p_status: status,
      })
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-roster", sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", sessionId],
      })
    },
  })
}

// ============================================================
// Session notes
// ============================================================

export function useSaveSessionNotes() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      notes,
    }: {
      sessionId: number
      notes: string
    }) => {
      const { error } = await supabase.rpc("coach_save_session_notes", {
        p_session_id: sessionId,
        p_notes: notes,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", sessionId],
      })
    },
  })
}

// ============================================================
// Session curriculum tags
// ============================================================

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
    }): Promise<number> => {
      const { data, error } = await supabase.rpc(
        "coach_tag_session_curriculum",
        {
          p_session_id: sessionId,
          p_module_ids: moduleIds,
        }
      )
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-curriculum", sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", sessionId],
      })
    },
  })
}

// ============================================================
// Milestones — single tick
// ============================================================

export function useMarkModuleComplete() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      memberId,
      moduleId,
      sessionId,
      notes,
    }: {
      memberId: number
      moduleId: number
      sessionId?: number | null
      notes?: string | null
    }): Promise<{ alreadyCompleted: boolean; levelNowComplete: boolean }> => {
      const { data, error } = await supabase.rpc("coach_mark_module_complete", {
        p_member_id: memberId,
        p_module_id: moduleId,
        p_session_id: sessionId ?? null,
        p_notes: notes?.trim() || null,
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
    onSuccess: (_, { memberId, sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ["member-progress", memberId] })
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["module-matrix"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
      if (sessionId != null) {
        queryClient.invalidateQueries({
          queryKey: ["milestone-picker", sessionId],
        })
      }
    },
  })
}

// ============================================================
// Milestones — batch tick (one module × many students)
// ============================================================

export function useMarkModuleCompleteBatch() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      memberIds,
      moduleId,
      sessionId,
    }: {
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
          p_member_ids: memberIds,
          p_module_id: moduleId,
          p_session_id: sessionId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_, { memberIds, sessionId }) => {
      memberIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["module-matrix"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
      if (sessionId != null) {
        queryClient.invalidateQueries({
          queryKey: ["milestone-picker", sessionId],
        })
      }
    },
  })
}

// ============================================================
// Milestones — single untick
// ============================================================

export function useUnmarkModuleComplete() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      memberId,
      moduleId,
    }: {
      memberId: number
      moduleId: number
    }) => {
      const { error } = await supabase.rpc("coach_unmark_module_complete", {
        p_member_id: memberId,
        p_module_id: moduleId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["member-progress", memberId] })
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["module-matrix"] })
      queryClient.invalidateQueries({ queryKey: ["milestone-picker"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// Milestones — bulk arbitrary (member, module) pairs
// used by the matrix grid
// ============================================================

export function useMarkModulesBulk() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      marks,
      sessionId,
    }: {
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
      const payload = marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await supabase.rpc("coach_mark_modules_bulk", {
        p_marks: payload,
        p_session_id: sessionId ?? null,
      })
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        moduleId: r.module_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_, { marks, sessionId }) => {
      const touched = new Set(marks.map((m) => m.memberId))
      touched.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["module-matrix"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
      if (sessionId != null) {
        queryClient.invalidateQueries({
          queryKey: ["milestone-picker", sessionId],
        })
      }
    },
  })
}

export function useUnmarkModulesBulk() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      marks,
    }: {
      marks: { memberId: number; moduleId: number }[]
    }): Promise<number> => {
      const payload = marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await supabase.rpc("coach_unmark_modules_bulk", {
        p_marks: payload,
      })
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: (_, { marks }) => {
      const touched = new Set(marks.map((m) => m.memberId))
      touched.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["module-matrix"] })
      queryClient.invalidateQueries({ queryKey: ["milestone-picker"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// Progress notes — add + delete
// ============================================================

export function useAddProgressNote() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      memberId,
      note,
      share = false,
    }: {
      memberId: number
      note: string
      share?: boolean
    }): Promise<number> => {
      const { data, error } = await supabase.rpc("coach_add_progress_note", {
        p_member_id: memberId,
        p_note: note,
        p_share: share,
      })
      if (error) throw new Error(error.message)
      return Number(data)
    },
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["progress-notes", memberId] })
      queryClient.invalidateQueries({ queryKey: ["member-progress", memberId] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

export function useDeleteProgressNote() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      noteId,
    }: {
      noteId: number
      memberId: number
    }): Promise<void> => {
      const { error } = await supabase.rpc("coach_delete_progress_note", {
        p_id: noteId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["progress-notes", memberId] })
      queryClient.invalidateQueries({ queryKey: ["member-progress", memberId] })
      queryClient.invalidateQueries({ queryKey: ["progression-board"] })
      queryClient.invalidateQueries({ queryKey: ["progression-summary"] })
      queryClient.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}
