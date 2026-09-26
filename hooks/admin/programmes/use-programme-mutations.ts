import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { ProgrammeType } from "./use-programmes"

export {
  useAssignCoachToProgramme,
  useRemoveCoachFromProgramme,
} from "./use-programme-coaches"

export {
  useGenerateSessions,
  useUpdateSession,
  useDeleteSession,
  useAddCoachToSession,
  useRemoveCoachFromSession,
  useSyncSessionCoaches,
} from "./use-session-mutations"

export {
  useTagSessionCurriculum,
  useRemoveModuleFromSession,
} from "./use-curriculum-mutations"

export type ProgrammeInput = {
  name: string
  type: ProgrammeType
  venueId: number
  levelId?: number | null
  minAge?: number | null
  maxAge?: number | null
  genderRestriction?: "male" | "female" | "any"
  recurrenceRule?: string | null
  termStart?: string | null
  termEnd?: string | null
  price?: number
  capacity?: number
  maxRatio?: number | null
  description?: string | null
  imageUrl?: string | null
}

function useInvalidateProgrammes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["admin-programmes"] })
}

export function useCreateProgramme() {
  const supabase = createClient()
  const invalidate = useInvalidateProgrammes()

  return useMutation({
    mutationFn: async (input: ProgrammeInput) => {
      const payload = {
        p_name: input.name,
        p_type: input.type,
        p_venue_id: input.venueId,
        p_level_id: input.levelId ?? null,
        p_min_age: input.minAge ?? null,
        p_max_age: input.maxAge ?? null,
        p_gender_restriction: input.genderRestriction ?? "any",
        p_recurrence_rule: input.recurrenceRule ?? null,
        p_price: input.price ?? 0,
        p_capacity: input.capacity ?? 0,
        p_max_ratio: input.maxRatio ?? null,
        p_description: input.description ?? null,
        p_image_url: input.imageUrl ?? null,
      }

      console.log("[useCreateProgramme] payload:", payload)

      const { data, error } = await supabase.rpc(
        "admin_create_programme",
        payload
      )

      if (error) {
        console.error("[useCreateProgramme] RPC error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        console.error(
          "[useCreateProgramme] full error:",
          JSON.stringify(error, null, 2)
        )
        throw error
      }

      return data as number
    },
    onSuccess: invalidate,
  })
}

export function useUpdateProgramme() {
  const supabase = createClient()
  const invalidate = useInvalidateProgrammes()

  return useMutation({
    mutationFn: async (input: Partial<ProgrammeInput> & { id: number }) => {
      const payload = {
        p_programme_id: input.id,
        p_name: input.name ?? null,
        p_type: input.type ?? null,
        p_level_id: input.levelId ?? null,
        p_venue_id: input.venueId ?? null,
        p_min_age: input.minAge ?? null,
        p_max_age: input.maxAge ?? null,
        p_gender_restriction: input.genderRestriction ?? null,
        p_recurrence_rule: input.recurrenceRule ?? null,
        p_term_start: input.termStart ?? null,
        p_term_end: input.termEnd ?? null,
        p_price: input.price ?? null,
        p_capacity: input.capacity ?? null,
        p_max_ratio: input.maxRatio ?? null,
        p_description: input.description ?? null,
        p_image_url: input.imageUrl ?? null,
      }

      console.log("[useUpdateProgramme] payload sent to RPC:", payload)
      console.log(
        "[useUpdateProgramme] payload keys:",
        Object.keys(payload).join(", ")
      )

      const { data, error } = await supabase.rpc(
        "admin_update_programme",
        payload
      )

      if (error) {
        console.error("[useUpdateProgramme] RPC error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        console.error(
          "[useUpdateProgramme] full error:",
          JSON.stringify(error, null, 2)
        )
        throw error
      }

      console.log("[useUpdateProgramme] success:", data)
      return data
    },
    onSuccess: invalidate,
  })
}

export function useToggleProgrammeArchive() {
  const supabase = createClient()
  const invalidate = useInvalidateProgrammes()

  return useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const fn = archived
        ? "admin_unarchive_programme"
        : "admin_archive_programme"
      const { error } = await supabase.rpc(fn, { p_programme_id: id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useDeleteProgramme() {
  const supabase = createClient()
  const invalidate = useInvalidateProgrammes()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_programme", {
        p_programme_id: id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
