import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type MemberProgression = {
  currentLevelId: number | null
  currentLevelName: string | null
  currentLevelGoal: string | null
  currentLevelFocus: string | null
  latestBadgeComplete: boolean | null
  latestProgressionNotes: string | null
  latestProgressionDate: string | null
  modulesCovered: { id: number; name: string; category: string }[]
  nextLevelId: number | null
  nextLevelName: string | null
  nextLevelGoal: string | null
}

type MemberProgressionRow = {
  current_level_id: number | null
  current_level_name: string | null
  current_level_goal: string | null
  current_level_focus: string | null
  latest_badge_complete: boolean | null
  latest_progression_notes: string | null
  latest_progression_date: string | null
  modules_covered: { id: number; name: string; category: string }[]
  next_level_id: number | null
  next_level_name: string | null
  next_level_goal: string | null
}

function toMemberProgression(row: MemberProgressionRow): MemberProgression {
  return {
    currentLevelId: row.current_level_id,
    currentLevelName: row.current_level_name,
    currentLevelGoal: row.current_level_goal,
    currentLevelFocus: row.current_level_focus,
    latestBadgeComplete: row.latest_badge_complete,
    latestProgressionNotes: row.latest_progression_notes,
    latestProgressionDate: row.latest_progression_date,
    modulesCovered: row.modules_covered ?? [],
    nextLevelId: row.next_level_id,
    nextLevelName: row.next_level_name,
    nextLevelGoal: row.next_level_goal,
  }
}

export function useMemberProgression(memberId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["members", memberId, "progression"],
    queryFn: async (): Promise<MemberProgression> => {
      const { data, error } = await supabase
        .rpc("get_member_progression", { p_member_id: Number(memberId) })
        .single<MemberProgressionRow>()

      if (error) throw new Error(error.message)
      return toMemberProgression(data)
    },
    enabled: !!memberId,
  })
}
