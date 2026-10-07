import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

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
    }) => {
      const { data, error } = await supabase.rpc("coach_bulk_mark_attendance", {
        p_session_id: sessionId,
        p_status: status,
      })
      if (error) throw new Error(error.message)
      return data as number
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
      const { data, error } = await supabase.rpc(
        "coach_tag_session_curriculum",
        {
          p_session_id: sessionId,
          p_module_ids: moduleIds,
        }
      )
      if (error) throw new Error(error.message)
      return data as number
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
