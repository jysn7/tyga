import { useQuery } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type CoachInvite = {
  id: number
  email: string
  coachType: "head_coach" | "assistant_coach" | "volunteer" | null
  maxStudentRatio: number | null
  invitedByName: string | null
  status: "pending" | "accepted" | "revoked"
  createdAt: string
}

type CoachInviteRow = {
  id: number
  email: string
  coach_type: CoachInvite["coachType"]
  max_student_ratio: number | null
  invited_by_name: string | null
  status: CoachInvite["status"]
  created_at: string
}

function toInvite(row: CoachInviteRow): CoachInvite {
  return {
    id: row.id,
    email: row.email,
    coachType: row.coach_type,
    maxStudentRatio: row.max_student_ratio,
    invitedByName: row.invited_by_name,
    status: row.status,
    createdAt: row.created_at,
  }
}

export function useCoachInvites(status: string | null = "pending") {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-coach-invites", status ?? "all"],
    queryFn: async (): Promise<CoachInvite[]> => {
      const { data, error } = await supabase.rpc("admin_get_coach_invites", {
        p_status: status,
      })
      if (error) throw error
      return (data as CoachInviteRow[]).map(toInvite)
    },
  })
}

export function useRevokeCoachInvite() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_revoke_coach_invite", {
        p_invite_id: id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coach-invites"] })
    },
  })
}
