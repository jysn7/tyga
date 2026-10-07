import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useMarkAttendance() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      sessionId: number
      memberId: number
      status: "present" | "absent" | "late" | "excused"
    }) => {
      const { error } = await supabase.rpc("coach_mark_attendance", {
        p_session_id: args.sessionId,
        p_member_id: args.memberId,
        p_status: args.status,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-roster", args.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", args.sessionId],
      })
    },
  })
}

export function useBulkMarkAttendance() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      sessionId: number
      status: "present" | "absent" | "late" | "excused"
    }) => {
      const { error } = await supabase.rpc("coach_bulk_mark_attendance", {
        p_session_id: args.sessionId,
        p_status: args.status,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-roster", args.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", args.sessionId],
      })
    },
  })
}

export function useSaveSessionNotes() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: { sessionId: number; notes: string }) => {
      const { error } = await supabase.rpc("coach_save_session_notes", {
        p_session_id: args.sessionId,
        p_notes: args.notes,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", args.sessionId],
      })
    },
  })
}

export function useTagSessionCurriculum() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: { sessionId: number; moduleIds: number[] }) => {
      const { error } = await supabase.rpc("coach_tag_session_curriculum", {
        p_session_id: args.sessionId,
        p_module_ids: args.moduleIds,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({
        queryKey: ["coach-session-curriculum", args.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ["coach-session-detail", args.sessionId],
      })
    },
  })
}
