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
  current_level_name: string | null
  next_session_label: string | null
  active_enrollment_count: number
  onboarding_complete: boolean
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
    onboardingComplete: row.onboarding_complete,
  }
}

export type MemberFilters = {
  search?: string
  gender?: "male" | "female"
  levelId?: number
  includeArchived?: boolean
}

export function useMembers(filters: MemberFilters = {}) {
  const supabase = createClient()
  const { search, gender, levelId, includeArchived = false } = filters

  return useQuery({
    queryKey: ["members", { search, gender, levelId, includeArchived }],
    queryFn: async (): Promise<UiMember[]> => {
      const { data, error } = await supabase.rpc(
        "get_my_members_with_details",
        {
          p_search: search || null,
          p_gender: gender || null,
          p_level_id: levelId ?? null,
          p_include_archived: includeArchived,
        }
      )
      if (error) throw new Error(error.message)
      return (data as MemberWithDetailsRow[]).map(toUiMember)
    },
  })
}
