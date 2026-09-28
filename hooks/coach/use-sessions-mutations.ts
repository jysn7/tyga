import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useMarkAttendance() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      sessionId: number
      memberId: number
      status: "present" | "absent" | "late"
    }) => {
      const { error } = await supabase.rpc("coach_mark_attendance", {
        p_session_id: args.sessionId,
        p_member_id: args.memberId,
        p_status: args.status,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({
        queryKey: ["coach", "session", args.sessionId, "roster"],
      })
    },
  })
}

export function useBulkMarkPresent() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { error } = await supabase.rpc("coach_bulk_mark_attendance", {
        p_session_id: sessionId,
        p_status: "present",
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({
        queryKey: ["coach", "session", sessionId, "roster"],
      })
    },
  })
}

export function useSaveSessionNotes() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: { sessionId: number; notes: string }) => {
      const { error } = await supabase.rpc("coach_save_session_notes", {
        p_session_id: args.sessionId,
        p_notes: args.notes,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["coach", "session", args.sessionId] })
    },
  })
}
