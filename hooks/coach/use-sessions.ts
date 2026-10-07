import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CoachSessionStatus = "scheduled" | "cancelled" | "completed"

export type CoachSession = {
  session_id: number
  programme_name: string
  session_date: string
  start_time: string
  end_time: string
  venue_name: string
  enrolled_count: number
  attendance_count: number
  notes_present: boolean
  status: CoachSessionStatus
}

export type CoachSessionDetail = {
  session_id: number
  programme_id?: number
  programme_name: string
  venue_id?: number | null
  venue_name: string | null
  session_date?: string
  start_time: string | null
  end_time: string | null
  status?: CoachSessionStatus
  coach_notes?: string | null
  max_ratio: number | null
  enrolled_count: number
  coach_count?: number
  is_over_ratio?: boolean
  coach_assignments?: {
    coach_id: number
    coach_name: string | null
    role_in_session: "lead" | "assistant" | "volunteer" | null
  }[]
}

export type CoachRosterMember = {
  member_id: number
  full_name: string
  attendance_status: "present" | "absent" | "late" | "excused" | null
}

export type CoachCurriculumModule = {
  module_id: number
  module_name: string
  category: string | null
  is_tagged: boolean
}

export type CoachRosterEntry = {
  programme_id: number
  programme_name: string
  member_id: number
  full_name: string
  current_level_id: number | null
  current_level_name: string | null
}

export type CoachCurriculumModuleOption = {
  id: number
  level_id: number
  level_name: string
  category: string | null
  name: string
  description: string | null
  is_milestone: boolean
}

export function useCoachSessions(startDate: string, endDate: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-sessions", startDate, endDate],
    enabled: Boolean(startDate && endDate),
    queryFn: async (): Promise<CoachSession[]> => {
      const { data, error } = await supabase.rpc("coach_get_sessions", {
        p_start_date: startDate,
        p_end_date: endDate,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as CoachSession[]
    },
  })
}

export function useCoachSessionDetail(sessionId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-session-detail", sessionId],
    enabled: sessionId > 0,
    queryFn: async (): Promise<CoachSessionDetail | null> => {
      const { data, error } = await supabase.rpc("coach_get_session_detail", {
        p_session_id: sessionId,
      })
      if (error) throw new Error(error.message)
      return data as CoachSessionDetail | null
    },
  })
}

export function useCoachSessionRoster(sessionId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-session-roster", sessionId],
    enabled: sessionId > 0,
    queryFn: async (): Promise<CoachRosterMember[]> => {
      const { data, error } = await supabase.rpc("coach_get_session_roster", {
        p_session_id: sessionId,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as CoachRosterMember[]
    },
  })
}

export function useCoachSessionCurriculum(sessionId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-session-curriculum", sessionId],
    enabled: sessionId > 0,
    queryFn: async (): Promise<CoachCurriculumModule[]> => {
      const { data, error } = await supabase.rpc(
        "coach_get_session_curriculum",
        { p_session_id: sessionId }
      )
      if (error) throw new Error(error.message)
      return (data ?? []) as CoachCurriculumModule[]
    },
  })
}

export function useCoachRoster() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-roster"],
    queryFn: async (): Promise<CoachRosterEntry[]> => {
      const { data, error } = await supabase.rpc("coach_get_roster")
      if (error) throw new Error(error.message)
      return (data ?? []) as CoachRosterEntry[]
    },
  })
}

export function useCoachCurriculumModules(levelId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-curriculum-modules", levelId],
    enabled: levelId > 0,
    queryFn: async (): Promise<CoachCurriculumModuleOption[]> => {
      const { data, error } = await supabase.rpc(
        "coach_get_curriculum_modules",
        { p_level_id: levelId }
      )
      if (error) throw new Error(error.message)
      return (data ?? []) as CoachCurriculumModuleOption[]
    },
  })
}
