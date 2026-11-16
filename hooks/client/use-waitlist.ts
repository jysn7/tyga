import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type WaitlistEntry = {
  id: number
  programmeId: number
  programmeName: string
  memberId: number
  memberName: string
  status: "waiting" | "notified"
  position: number
  notifiedAt: string | null
  createdAt: string
}

// Shape returned by parent_get_my_waitlist()
type WaitlistRow = {
  id: number
  programme_id: number
  programme_name: string
  member_id: number
  member_name: string
  status: "waiting" | "notified"
  queue_position: number
  notified_at: string | null
  created_at: string
}

export function useMyWaitlist() {
  return useQuery({
    queryKey: ["my-waitlist"],
    queryFn: async (): Promise<WaitlistEntry[]> => {
      const { data, error } = await createClient().rpc("parent_get_my_waitlist")
      if (error) throw new Error(error.message)
      return ((data ?? []) as WaitlistRow[]).map((w) => ({
        id: w.id,
        programmeId: w.programme_id,
        programmeName: w.programme_name,
        memberId: w.member_id,
        memberName: w.member_name,
        status: w.status,
        position: w.queue_position,
        notifiedAt: w.notified_at,
        createdAt: w.created_at,
      }))
    },
  })
}

export function useJoinWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { memberId: number; programmeId: number }) => {
      const { data, error } = await createClient().rpc("parent_join_waitlist", {
        p_member_id: input.memberId,
        p_programme_id: input.programmeId,
      })
      if (error) throw new Error(error.message)
      return data as { id: number; position: number }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-waitlist"] })
      qc.invalidateQueries({ queryKey: ["programme-page"] })
    },
  })
}

export function useLeaveWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await createClient().rpc("parent_leave_waitlist", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-waitlist"] }),
  })
}
