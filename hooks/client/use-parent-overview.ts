import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ---------- Types (camelCase — what the components expect) ----------

export type ParentStats = {
  activeMembers: number
  upcomingSessions: number
  outstandingBalance: number
  badgesThisMonth: number
}

export type ChildSummary = {
  id: number
  name: string
  age: number
  level: string | null
  initials: string
  nextSession: string | null
  nextProgramme: string | null
  venue: string | null
  attendance: number
  badges: number
}

export type UpcomingSession = {
  id: number
  childName: string
  programmeName: string
  date: string
  time: string
  venue: string
}

export type ProgressItem = {
  id: number
  childName: string
  milestone: string
  time: string
}

export type OutstandingInvoice = {
  id: number
  description: string
  amount: number
  due: string
  overdue: boolean
}

// ---------- Helpers ----------

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

// ---------- Hooks ----------

export function useParentStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["parent-stats"],
    queryFn: async (): Promise<ParentStats> => {
      const { data, error } = await supabase.rpc("parent_get_stats").single<{
        active_members: number
        upcoming_sessions: number
        outstanding_balance: number
        badges_this_month: number
      }>()
      if (error) throw error
      return {
        activeMembers: Number(data.active_members),
        upcomingSessions: Number(data.upcoming_sessions),
        outstandingBalance: Number(data.outstanding_balance),
        badgesThisMonth: Number(data.badges_this_month),
      }
    },
  })
}

type ParentChildRow = {
  id: number
  full_name: string
  age: number
  level_name: string | null
  initials: string
  next_session_label: string | null
  next_programme_name: string | null
  next_venue_name: string | null
  attendance_rate: number | string
  badges: number | string
}

export function useParentChildren() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["parent-children"],
    queryFn: async (): Promise<ChildSummary[]> => {
      const { data, error } = await supabase.rpc("parent_get_children")
      if (error) throw error
      return ((data as ParentChildRow[] | null) ?? []).map((row) => ({
        id: row.id,
        name: row.full_name,
        age: row.age,
        level: row.level_name,
        initials: row.initials,
        nextSession: row.next_session_label,
        nextProgramme: row.next_programme_name,
        venue: row.next_venue_name,
        attendance: Number(row.attendance_rate),
        badges: Number(row.badges),
      }))
    },
  })
}

type ParentUpcomingSessionRow = {
  session_id: number
  member_name: string
  programme_name: string
  session_date: string
  start_time: string | null
  venue_name: string | null
}

export function useParentUpcomingSessions(limit = 4) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["parent-upcoming-sessions", limit],
    queryFn: async (): Promise<UpcomingSession[]> => {
      const { data, error } = await supabase.rpc(
        "parent_get_upcoming_sessions",
        {
          p_limit: limit,
        }
      )
      if (error) throw error
      return ((data as ParentUpcomingSessionRow[] | null) ?? []).map((row) => ({
        id: row.session_id,
        childName: row.member_name,
        programmeName: row.programme_name,
        date: new Date(row.session_date).toLocaleDateString("en-ZA", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        time: row.start_time?.slice(0, 5) ?? "",
        venue: row.venue_name ?? "",
      }))
    },
  })
}

type ParentProgressRow = {
  milestone_id: number
  member_name: string
  milestone_name: string
  completed_at: string | null
}

export function useParentProgress(limit = 5) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["parent-progress", limit],
    queryFn: async (): Promise<ProgressItem[]> => {
      const { data, error } = await supabase.rpc("parent_get_recent_progress", {
        p_limit: limit,
      })
      if (error) throw error
      return ((data as ParentProgressRow[] | null) ?? []).map((row) => ({
        id: row.milestone_id,
        childName: row.member_name,
        milestone: row.milestone_name,
        time: row.completed_at ? timeAgo(row.completed_at) : "",
      }))
    },
  })
}

type ParentOutstandingInvoiceRow = {
  invoice_id: number
  description: string
  amount: number | string
  due_at: string | null
  is_overdue: boolean
}

export function useParentOutstandingInvoices() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["parent-outstanding-invoices"],
    queryFn: async (): Promise<OutstandingInvoice[]> => {
      const { data, error } = await supabase.rpc(
        "parent_get_outstanding_invoices"
      )
      if (error) throw error
      return ((data as ParentOutstandingInvoiceRow[] | null) ?? []).map(
        (row) => ({
          id: row.invoice_id,
          description: row.description,
          amount: Number(row.amount),
          due: row.due_at
            ? new Date(row.due_at).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "No due date",
          overdue: row.is_overdue,
        })
      )
    },
  })
}
