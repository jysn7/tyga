import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type RosterEntry = {
  enrollmentId: number
  memberId: number
  memberName: string
  memberAge: number
  gender: string | null
  currentLevelId: number | null
  currentLevelName: string | null
  nextLevelId: number | null
  nextLevelName: string | null
  programmeId: number
  programmeName: string
  attendanceRate: number | null
  joinedAt: string | null
}

type RosterRow = {
  enrollment_id: number
  member_id: number
  member_name: string
  member_age: number
  gender: string | null
  current_level_id: number | null
  current_level_name: string | null
  next_level_id: number | null
  next_level_name: string | null
  programme_id: number
  programme_name: string
  attendance_rate: number | null
  joined_at: string | null
}

function toEntry(row: RosterRow): RosterEntry {
  return {
    enrollmentId: row.enrollment_id,
    memberId: row.member_id,
    memberName: row.member_name,
    memberAge: row.member_age,
    gender: row.gender,
    currentLevelId: row.current_level_id,
    currentLevelName: row.current_level_name,
    nextLevelId: row.next_level_id,
    nextLevelName: row.next_level_name,
    programmeId: row.programme_id,
    programmeName: row.programme_name,
    attendanceRate: row.attendance_rate,
    joinedAt: row.joined_at,
  }
}

export function useCoachRoster() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-roster"],
    queryFn: async (): Promise<RosterEntry[]> => {
      const { data, error } = await supabase.rpc("coach_get_roster")
      if (error) throw new Error(error.message)
      return ((data ?? []) as RosterRow[]).map(toEntry)
    },
  })
}
