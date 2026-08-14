import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CurriculumModule = {
  id: number
  levelId: number
  levelName: string
  category: "technical" | "physical" | "mental_character" | "format" | null
  name: string
  description: string | null
  isMilestone: boolean
  archivedAt: string | null
}

type CurriculumModuleRow = {
  id: number
  level_id: number
  level_name: string
  category: "technical" | "physical" | "mental_character" | "format" | null
  name: string
  description: string | null
  is_milestone: boolean
  archived_at: string | null
}

function toModule(row: CurriculumModuleRow): CurriculumModule {
  return {
    id: row.id,
    levelId: row.level_id,
    levelName: row.level_name,
    category: row.category,
    name: row.name,
    description: row.description,
    isMilestone: row.is_milestone,
    archivedAt: row.archived_at,
  }
}

export function useCurriculumModules(levelId?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-curriculum-modules", levelId ?? "all"],
    queryFn: async (): Promise<CurriculumModule[]> => {
      const { data, error } = await supabase.rpc(
        "admin_get_curriculum_modules",
        {
          p_level_id: levelId ?? null,
        }
      )
      if (error) throw error
      return (data as CurriculumModuleRow[]).map(toModule)
    },
  })
}
