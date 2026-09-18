import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ---------- Session Mutations ----------

export function useGenerateSessions() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      programmeId,
      daysOfWeek,
      startTime,
      endTime,
      rangeStart,
      rangeEnd,
    }: {
      programmeId: number
      daysOfWeek: number[]
      startTime: string
      endTime: string
      rangeStart: string
      rangeEnd: string
    }) => {
      const { data, error } = await supabase.rpc(
        "admin_generate_programme_sessions",
        {
          p_programme_id: programmeId,
          p_days_of_week: daysOfWeek,
          p_start_time: startTime,
          p_end_time: endTime,
          p_range_start: rangeStart,
          p_range_end: rangeEnd,
        }
      )
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}

export function useUpdateSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      sessionDate,
      startTime,
      endTime,
      venueId,
      status,
      coachNotes,
    }: {
      sessionId: number
      sessionDate?: string
      startTime?: string
      endTime?: string
      venueId?: number
      status?: string
      coachNotes?: string
    }) => {
      const { error } = await supabase.rpc("admin_update_session", {
        p_session_id: sessionId,
        p_session_date: sessionDate ?? null,
        p_start_time: startTime ?? null,
        p_end_time: endTime ?? null,
        p_venue_id: venueId ?? null,
        p_status: status ?? null,
        p_coach_notes: coachNotes ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}

export function useDeleteSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { error } = await supabase.rpc("admin_delete_session", {
        p_session_id: sessionId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] })
    },
  })
}

// ---------- Session Coach Mutations ----------

export function useAddCoachToSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      coachId,
      role,
    }: {
      sessionId: number
      coachId: number
      role: string
    }) => {
      const { error } = await supabase.rpc("admin_add_coach_to_session", {
        p_session_id: sessionId,
        p_coach_id: coachId,
        p_role_in_session: role,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-coaches"] })
    },
  })
}

export function useRemoveCoachFromSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      coachId,
    }: {
      sessionId: number
      coachId: number
    }) => {
      const { error } = await supabase.rpc("admin_remove_coach_from_session", {
        p_session_id: sessionId,
        p_coach_id: coachId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-coaches"] })
    },
  })
}

export function useSyncSessionCoaches() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { error } = await supabase.rpc("admin_sync_session_coaches", {
        p_session_id: sessionId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-coaches"] })
    },
  })
}
