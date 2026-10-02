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
}

export function useCoachSessions(startDate: string, endDate: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ["coach-sessions", startDate, endDate],
    enabled: !!startDate && !!endDate,
    queryFn: async (): Promise<CoachSession[]> => {
      console.log("[coach_get_sessions] request", { startDate, endDate })

      const { data, error } = await supabase.rpc("coach_get_sessions", {
        p_start_date: startDate,
        p_end_date: endDate,
      })

      if (error) {
        console.error("[coach_get_sessions] error", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(error.message)
      }

      console.log("[coach_get_sessions] data", data)
      return (data ?? []) as CoachSession[]
    },
  })
}
