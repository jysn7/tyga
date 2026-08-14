import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CoachType = "head_coach" | "assistant_coach" | "volunteer"

export type Coach = {
  id: number
  accountId: string | null
  fullName: string
  email: string
  active: boolean
  coachType: CoachType | null
  linkedMemberId: number | null
  maxStudentRatio: number | null
}

type CoachRow = {
  id: number
  account_id: string | null
  full_name: string | null
  email: string | null
  active: boolean | null
  coach_type: CoachType | null
  linked_member_id: number | null
  max_student_ratio: number | null
}

function toCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    accountId: row.account_id,
    fullName: row.full_name ?? "Unnamed",
    email: row.email ?? "",
    active: row.active ?? false,
    coachType: row.coach_type,
    linkedMemberId: row.linked_member_id,
    maxStudentRatio: row.max_student_ratio,
  }
}

export type UseCoachesFilters = {
  search?: string
  active?: boolean
}

export function useCoaches({ search, active }: UseCoachesFilters = {}) {
  const supabase = createClient()
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: ["admin-coaches", normalizedSearch ?? "", active ?? "all"],
    queryFn: async (): Promise<Coach[]> => {
      const { data, error } = await supabase.rpc("admin_get_coaches", {
        p_coach_id: null,
        p_search: normalizedSearch ?? null,
        p_active: active ?? null,
      })
      if (error) throw error
      return (data as CoachRow[]).map(toCoach)
    },
    placeholderData: (previousData) => previousData,
  })
}
