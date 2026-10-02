import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export type ScheduleKind = "programme_session" | "appointment"

export type ScheduleEntry = {
  id: string // "sess-42" / "appt-7"
  rawId: number
  kind: ScheduleKind
  status: string
  title: string
  subtitle: string
  startsAt: string
  endsAt: string
}

type ScheduleRow = {
  kind: ScheduleKind
  id: number
  status: string
  title: string
  subtitle: string
  starts_at: string
  ends_at: string
}

function toEntry(row: ScheduleRow): ScheduleEntry {
  return {
    id: `${row.kind === "programme_session" ? "sess" : "appt"}-${row.id}`,
    rawId: row.id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    subtitle: row.subtitle,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }
}

export function useCoachSchedule(from: string, to: string) {
  return useQuery({
    queryKey: ["schedule", "coach", from, to],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data, error } = await supabase.rpc("coach_get_full_schedule", {
        p_from: from,
        p_to: to,
      })
      if (error) throw error
      return ((data ?? []) as ScheduleRow[]).map(toEntry)
    },
  })
}

export function useParentSchedule(
  from: string,
  to: string,
  memberId?: number | null
) {
  return useQuery({
    queryKey: ["schedule", "parent", from, to, memberId ?? "all"],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data, error } = await supabase.rpc("parent_get_full_schedule", {
        p_from: from,
        p_to: to,
        p_member_id: memberId ?? null,
      })
      if (error) throw error
      return ((data ?? []) as ScheduleRow[]).map(toEntry)
    },
  })
}

export function useAdminSchedule(
  from: string,
  to: string,
  filters: { coachId?: number | null; venueId?: number | null } = {}
) {
  return useQuery({
    queryKey: [
      "schedule",
      "admin",
      from,
      to,
      filters.coachId ?? "all",
      filters.venueId ?? "all",
    ],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data, error } = await supabase.rpc("admin_get_full_schedule", {
        p_from: from,
        p_to: to,
        p_coach_id: filters.coachId ?? null,
        p_venue_id: filters.venueId ?? null,
      })
      if (error) throw error
      return ((data ?? []) as ScheduleRow[]).map(toEntry)
    },
  })
}
