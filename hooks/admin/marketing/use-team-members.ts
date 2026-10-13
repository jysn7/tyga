"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  teamMemberSchema,
  type TeamMemberInput,
} from "@/lib/validations/marketing/team-member"

export type TeamMember = {
  id: number
  display_name: string
  role_title: string
  bio: string | null
  portrait_url: string | null
  coach_id: number | null
  sort_order: number
  visibility: "draft" | "published" | "archived"
  published_at: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

const KEY = "marketing-team-members"

export function useTeamMembers() {
  const supabase = createClient()
  return useQuery({
    queryKey: [KEY],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase.rpc("admin_get_team_members")
      if (error) throw new Error(error.message)
      return (data ?? []) as TeamMember[]
    },
  })
}

export function useUpsertTeamMember() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: number
      input: TeamMemberInput
    }) => {
      const parsed = teamMemberSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
      }
      const v = parsed.data

      const { data, error } = await supabase.rpc("admin_upsert_team_member", {
        p_id: id ?? null,
        p_display_name: v.displayName,
        p_role_title: v.roleTitle,
        p_bio: v.bio || null,
        p_portrait_url: v.portraitUrl ?? null,
        p_coach_id: v.coachId ?? null,
        p_sort_order: v.sortOrder,
        p_visibility: v.visibility,
      })
      if (error) throw new Error(error.message)
      return data as number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useDeleteTeamMember() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_team_member", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
