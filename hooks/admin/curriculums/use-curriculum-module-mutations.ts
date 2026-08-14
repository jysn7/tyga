import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { CurriculumModule } from "@/hooks/admin/curriculums/use-curriculum-modules"

export type CurriculumModuleInput = {
  levelId: number
  name: string
  category?: CurriculumModule["category"]
  description?: string
  isMilestone?: boolean
}

function useInvalidateModules() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ["admin-curriculum-modules"] })
}

export function useCreateCurriculumModule() {
  const supabase = createClient()
  const invalidate = useInvalidateModules()

  return useMutation({
    mutationFn: async (input: CurriculumModuleInput) => {
      const { data, error } = await supabase.rpc(
        "admin_create_curriculum_module",
        {
          p_level_id: input.levelId,
          p_name: input.name,
          p_category: input.category ?? null,
          p_description: input.description ?? null,
          p_is_milestone: input.isMilestone ?? false,
        }
      )
      if (error) throw error
      return data as number
    },
    onSuccess: invalidate,
  })
}

export function useUpdateCurriculumModule() {
  const supabase = createClient()
  const invalidate = useInvalidateModules()

  return useMutation({
    mutationFn: async (
      input: Omit<CurriculumModuleInput, "levelId"> & { id: number }
    ) => {
      const { error } = await supabase.rpc("admin_update_curriculum_module", {
        p_module_id: input.id,
        p_name: input.name,
        p_category: input.category ?? null,
        p_description: input.description ?? null,
        p_is_milestone: input.isMilestone ?? null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useToggleModuleArchive() {
  const supabase = createClient()
  const invalidate = useInvalidateModules()

  return useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const fn = archived
        ? "admin_unarchive_curriculum_module"
        : "admin_archive_curriculum_module"
      const { error } = await supabase.rpc(fn, { p_module_id: id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCurriculumModule() {
  const supabase = createClient()
  const invalidate = useInvalidateModules()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_curriculum_module", {
        p_module_id: id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
