import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Member as UiMember } from "@/components/portals/client/members/member-card"

// Raw shape returned by get_my_members_with_details() — snake_case,
// matches the SQL function's `returns table (...)` column list exactly.
type MemberWithDetailsRow = {
  id: number
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  medical_notes: string | null
  emergency_contact: string | null
  current_level_name: string | null
  next_session_label: string | null
  active_enrollment_count: number
}

function toUiMember(row: MemberWithDetailsRow): UiMember {
  return {
    id: String(row.id),
    fullName: row.full_name,
    dob: row.dob,
    gender: row.gender,
    currentLevelName: row.current_level_name,
    nextSessionLabel: row.next_session_label,
    activeEnrollmentCount: row.active_enrollment_count,
  }
}

export function useMembers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<UiMember[]> => {
      const { data, error } = await supabase.rpc("get_my_members_with_details")
      if (error) throw error
      return (data as MemberWithDetailsRow[]).map(toUiMember)
    },
  })
}
