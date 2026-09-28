import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CoachDashboardSummary = {
  today_sessions: number
  pending_assessments: number
}

export function useCoachDashboard() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["coach-dashboard"],
    queryFn: async (): Promise<CoachDashboardSummary> => {
      const { data, error } = await supabase.rpc("coach_get_dashboard_summary")
      if (error) throw new Error(error.message)
      return data as CoachDashboardSummary
    },
    staleTime: 30_000,
  })
}
