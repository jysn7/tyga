// hooks/admin/programmes/use-programme-coaches.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ---------- Queries ----------

export type ProgrammeCoach = {
  coachId: number
  fullName: string
  email: string
  roleInProgramme: string
}

type ProgrammeCoachRow = {
  coach_id: number
  full_name: string
  email: string
  role_in_programme: string
}

export function useGetProgrammeCoaches(programmeId: number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-programme-coaches", programmeId],
    enabled: !!programmeId,
    queryFn: async (): Promise<ProgrammeCoach[]> => {
      if (!programmeId) return []
      const { data, error } = await supabase.rpc(
        "admin_get_programme_coaches",
        {
          p_programme_id: programmeId,
        }
      )
      if (error) throw error

      // Map snake_case from RPC to camelCase for the component
      return (data as ProgrammeCoachRow[]).map((row) => ({
        coachId: row.coach_id,
        fullName: row.full_name,
        email: row.email,
        roleInProgramme: row.role_in_programme,
      }))
    },
  })
}

// ---------- Mutations ----------

export function useAssignCoachToProgramme() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      programmeId,
      coachId,
      role,
    }: {
      programmeId: number
      coachId: number
      role: string
    }) => {
      const { error } = await supabase.rpc("admin_assign_coach_to_programme", {
        p_programme_id: programmeId,
        p_coach_id: coachId,
        p_role_in_programme: role,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programme-coaches"] })
    },
  })
}

export function useRemoveCoachFromProgramme() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      programmeId,
      coachId,
    }: {
      programmeId: number
      coachId: number
    }) => {
      const { error } = await supabase.rpc(
        "admin_remove_coach_from_programme",
        {
          p_programme_id: programmeId,
          p_coach_id: coachId,
        }
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programme-coaches"] })
    },
  })
}
