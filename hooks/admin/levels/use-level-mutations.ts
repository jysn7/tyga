import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type LevelInput = {
  name: string
  sortOrder: number
  defaultAgeMin?: number
  defaultAgeMax?: number
  goal?: string
  focusSummary?: string
  upgradeCriteria?: string
}

function useInvalidateLevels() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["admin-levels"] })
}

export function useCreateLevel() {
  const supabase = createClient()
  const invalidate = useInvalidateLevels()

  return useMutation({
    mutationFn: async (input: LevelInput) => {
      const { data, error } = await supabase.rpc("admin_create_level", {
        p_name: input.name,
        p_sort_order: input.sortOrder,
        p_default_age_min: input.defaultAgeMin ?? null,
        p_default_age_max: input.defaultAgeMax ?? null,
        p_goal: input.goal ?? null,
        p_focus_summary: input.focusSummary ?? null,
        p_upgrade_criteria: input.upgradeCriteria ?? null,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: invalidate,
  })
}

export function useUpdateLevel() {
  const supabase = createClient()
  const invalidate = useInvalidateLevels()

  return useMutation({
    mutationFn: async (input: LevelInput & { id: number }) => {
      const { error } = await supabase.rpc("admin_update_level", {
        p_level_id: input.id,
        p_name: input.name,
        p_sort_order: input.sortOrder,
        p_default_age_min: input.defaultAgeMin ?? null,
        p_default_age_max: input.defaultAgeMax ?? null,
        p_goal: input.goal ?? null,
        p_focus_summary: input.focusSummary ?? null,
        p_upgrade_criteria: input.upgradeCriteria ?? null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useToggleLevelArchive() {
  const supabase = createClient()
  const invalidate = useInvalidateLevels()

  return useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const fn = archived ? "admin_unarchive_level" : "admin_archive_level"
      const { error } = await supabase.rpc(fn, { p_level_id: id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useDeleteLevel() {
  const supabase = createClient()
  const invalidate = useInvalidateLevels()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_level", {
        p_level_id: id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
