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

export function useClaimAssessment() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: number) => {
      const { error } = await supabase.rpc("coach_claim_assessment", {
        p_appointment_id: appointmentId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] })
    },
  })
}

export function useRecordAssessment() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      appointmentId: number
      assessedLevelId: number
      notes?: string | null
    }) => {
      const { error } = await supabase.rpc("coach_record_assessment", {
        p_appointment_id: args.appointmentId,
        p_assessed_level_id: args.assessedLevelId,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["coach-session-detail"] })
    },
  })
}

export function useRecordParentConsultation() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      appointmentId: number
      notes?: string | null
    }) => {
      const { error } = await supabase.rpc("coach_record_parent_consultation", {
        p_appointment_id: args.appointmentId,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] })
    },
  })
}

export function useSubmitProgression() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      memberId: number
      toLevelId: number
      badgeComplete?: boolean
      notes?: string | null
    }) => {
      const { error } = await supabase.rpc("coach_submit_progression", {
        p_member_id: args.memberId,
        p_to_level_id: args.toLevelId,
        p_badge_complete: args.badgeComplete ?? false,
        p_notes: args.notes ?? null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] })
    },
  })
}
