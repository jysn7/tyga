import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type WaitlistEntry = {
  id: number
  programmeId: number
  programmeName: string
  memberName: string
  parentName: string | null
  parentPhone: string | null
  status: "waiting" | "notified"
  queuePosition: number
  createdAt: string
  notifiedAt: string | null
}

type WaitlistRow = {
  id: number
  programme_id: number
  programme_name: string
  member_name: string
  parent_name: string | null
  parent_phone: string | null
  status: "waiting" | "notified"
  queue_position: number
  created_at: string
  notified_at: string | null
}

function toEntry(r: WaitlistRow): WaitlistEntry {
  return {
    id: r.id,
    programmeId: r.programme_id,
    programmeName: r.programme_name,
    memberName: r.member_name,
    parentName: r.parent_name,
    parentPhone: r.parent_phone,
    status: r.status,
    queuePosition: r.queue_position,
    createdAt: r.created_at,
    notifiedAt: r.notified_at,
  }
}

export function useProgrammeWaitlist(programmeId: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-programme-waitlist", programmeId],
    enabled: !!programmeId,
    queryFn: async (): Promise<WaitlistEntry[]> => {
      if (!programmeId) return []
      const { data, error } = await supabase.rpc("admin_get_waitlist", {
        p_programme_id: programmeId,
      })
      if (error) throw error
      return ((data ?? []) as WaitlistRow[]).map(toEntry)
    },
  })
}

export function useWaitlistCounts() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-waitlist-counts"],
    queryFn: async (): Promise<Record<number, number>> => {
      const { data, error } = await supabase.rpc("admin_get_waitlist", {
        p_programme_id: null,
      })
      if (error) throw error

      const counts: Record<number, number> = {}
      for (const row of (data ?? []) as WaitlistRow[]) {
        counts[row.programme_id] = (counts[row.programme_id] ?? 0) + 1
      }
      return counts
    },
    staleTime: 30_000,
  })
}
