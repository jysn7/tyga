import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { ProgrammeType, GenderRestriction } from "./use-programme"

export type UpdateProgrammeInput = {
  programmeId: number
  name?: string; venueId?: number; type?: ProgrammeType; levelId?: number
  minAge?: number; maxAge?: number; genderRestriction?: GenderRestriction
  recurrenceRule?: string; termStart?: string; termEnd?: string
  capacity?: number; price?: number; maxRatio?: number
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ programmeId, ...fields }: UpdateProgrammeInput) => {

      const patch: Record<string, unknown> = {}
      if (fields.name !== undefined) patch.name = fields.name
      if (fields.venueId !== undefined) patch.venue_id = fields.venueId
      if (fields.type !== undefined) patch.type = fields.type
      if (fields.levelId !== undefined) patch.level_id = fields.levelId
      if (fields.minAge !== undefined) patch.min_age = fields.minAge
      if (fields.maxAge !== undefined) patch.max_age = fields.maxAge
      if (fields.genderRestriction !== undefined) patch.gender_restriction = fields.genderRestriction
      if (fields.recurrenceRule !== undefined) patch.recurrence_rule = fields.recurrenceRule
      if (fields.termStart !== undefined) patch.term_start = fields.termStart
      if (fields.termEnd !== undefined) patch.term_end = fields.termEnd
      if (fields.capacity !== undefined) patch.capacity = fields.capacity
      if (fields.price !== undefined) patch.price = fields.price
      if (fields.maxRatio !== undefined) patch.max_ratio = fields.maxRatio

      const { error } = await supabase.from("programmes").update(patch).eq("id", programmeId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-programmes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-programmes", "detail", variables.programmeId] })
    },
  })
}