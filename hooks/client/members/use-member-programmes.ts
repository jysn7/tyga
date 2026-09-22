import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type MemberProgramme = {
  enrollmentId: number
  programmeId: number
  programmeName: string
  venueName: string | null
  status: string
  joinedAt: string
  nextSession: { date: string; startTime: string; endTime: string } | null
  recentSessions: { date: string; status: string | null }[]
}

type MemberProgrammeRow = {
  enrollment_id: number
  programme_id: number
  programme_name: string
  venue_name: string | null
  status: string
  joined_at: string
  next_session: { date: string; startTime: string; endTime: string } | null
  recent_sessions: { date: string; status: string | null }[]
}

function toMemberProgramme(row: MemberProgrammeRow): MemberProgramme {
  return {
    enrollmentId: row.enrollment_id,
    programmeId: row.programme_id,
    programmeName: row.programme_name,
    venueName: row.venue_name,
    status: row.status,
    joinedAt: row.joined_at,
    nextSession: row.next_session,
    recentSessions: row.recent_sessions ?? [],
  }
}

export function useMemberProgrammes(memberId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["members", memberId, "programmes"],
    queryFn: async (): Promise<MemberProgramme[]> => {
      const { data, error } = await supabase.rpc("get_member_programmes", {
        p_member_id: Number(memberId),
      })

      if (error) throw new Error(error.message)
      return (data ?? []).map(toMemberProgramme)
    },
    enabled: !!memberId,
  })
}
