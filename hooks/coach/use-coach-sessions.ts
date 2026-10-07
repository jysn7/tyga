import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

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
  status: string
}

export function useCoachSessions(startDate: string, endDate: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ["coach-sessions", startDate, endDate],
    enabled: !!startDate && !!endDate,
    queryFn: async (): Promise<CoachSession[]> => {
      const { data, error } = await supabase.rpc("coach_get_sessions", {
        p_start_date: startDate,
        p_end_date: endDate,
      })

      if (error) {
        throw new Error(error.message)
      }

      return (data ?? []) as CoachSession[]
    },
  })
}
