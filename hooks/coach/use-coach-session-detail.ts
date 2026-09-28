import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CoachSessionDetail = {
  session_id: number
  programme_name: string
  venue_name: string
  start_time: string
  end_time: string
  max_ratio: number | null
  enrolled_count: number
}

export type CoachRosterMember = {
  member_id: number
  full_name: string
  attendance_status: string | null
}

export type CoachCurriculumModule = {
  module_id: number
  module_name: string
  category: string | null
  is_tagged: boolean
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
      return data as CoachRosterMember[]
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
        {
          p_session_id: sessionId,
        }
      )
      if (error) throw new Error(error.message)
      return data as CoachCurriculumModule[]
    },
  })
}
