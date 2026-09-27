import { createClient } from "@supabase/supabase-js"

export function useSessions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getDashboardSummary = async () => {
    const { data, error } = await supabase.rpc("coach_get_dashboard_summary")
    if (error) throw new Error(error.message)
    return data
  }

  const getSessions = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase.rpc("coach_get_sessions", {
      p_start_date: startDate,
      p_end_date: endDate,
    })
    if (error) throw new Error(error.message)
    return data
  }

  const getSessionDetail = async (sessionId: number) => {
    const { data, error } = await supabase.rpc("coach_get_session_detail", {
      p_session_id: sessionId,
    })
    if (error) throw new Error(error.message)
    return data
  }

  const getSessionRoster = async (sessionId: number) => {
    const { data, error } = await supabase.rpc("coach_get_session_roster", {
      p_session_id: sessionId,
    })
    if (error) throw new Error(error.message)
    return data
  }

  const getSessionCurriculum = async (sessionId: number) => {
    const { data, error } = await supabase.rpc("coach_get_session_curriculum", {
      p_session_id: sessionId,
    })
    if (error) throw new Error(error.message)
    return data
  }

  return {
    getDashboardSummary,
    getSessions,
    getSessionDetail,
    getSessionRoster,
    getSessionCurriculum,
  }
}
