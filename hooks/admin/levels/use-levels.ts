// hooks/admin/use-levels.ts
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Level = {
  id: number
  name: string
  sortOrder: number
  defaultAgeMin: number | null
  defaultAgeMax: number | null
  goal: string | null
  focusSummary: string | null
  upgradeCriteria: string | null
  archivedAt: string | null
}

type LevelRow = {
  id: number
  name: string
  sort_order: number
  default_age_min: number | null
  default_age_max: number | null
  goal: string | null
  focus_summary: string | null
  upgrade_criteria: string | null
  archived_at: string | null
}

function toLevel(row: LevelRow): Level {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    defaultAgeMin: row.default_age_min,
    defaultAgeMax: row.default_age_max,
    goal: row.goal,
    focusSummary: row.focus_summary,
    upgradeCriteria: row.upgrade_criteria,
    archivedAt: row.archived_at,
  }
}

export function useLevels() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-levels"],
    queryFn: async (): Promise<Level[]> => {
      const { data, error } = await supabase.rpc("admin_get_levels", {
        p_level_id: null,
      })
      if (error) throw error
      return (data as LevelRow[]).map(toLevel)
    },
  })
}
