import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CurriculumModule = {
  id: number
  levelId: number
  levelName: string
  category: string | null
  name: string
  description: string | null
  isMilestone: boolean
}

type CurriculumModuleRow = {
  module_id: number
  level_id: number
  level_name: string
  category: string | null
  module_name: string
  description: string | null
  is_milestone: boolean
}

function toModule(row: CurriculumModuleRow): CurriculumModule {
  return {
    id: row.module_id,
    levelId: row.level_id,
    levelName: row.level_name,
    category: row.category,
    name: row.module_name,
    description: row.description,
    isMilestone: row.is_milestone,
  }
}

// Pass null to skip the request (e.g. a member with no level yet).
export function useCurriculumModules(levelId: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-curriculum-modules", levelId],
    enabled: levelId !== null,
    queryFn: async (): Promise<CurriculumModule[]> => {
      const { data, error } = await supabase.rpc("coach_get_curriculum_modules", {
        p_level_id: levelId,
      })
      if (error) throw new Error(error.message)
      return ((data ?? []) as CurriculumModuleRow[]).map(toModule)
    },
    staleTime: 10 * 60 * 1000, // curriculum rarely changes
  })
}
