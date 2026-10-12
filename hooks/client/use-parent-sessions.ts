import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

// ---------- Types ----------
export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export type ParentDashboardSummary = {
  children_count: number
  upcoming_7_days: number
  children: {
    member_id: number
    full_name: string
    next_session: {
      session_id: number
      programme_name: string
      session_date: string
      start_time: string
      end_time: string
      venue_name: string
    } | null
  }[]
}

export type ParentSessionRow = {
  session_id: number
  member_id: number
  member_name: string
  programme_id: number
  programme_name: string
  level_name: string | null
  session_date: string
  start_time: string
  end_time: string
  venue_name: string
  venue_address: string | null
  coach_names: string | null
  status: string | null
  attendance_status: AttendanceStatus | null
  notes_present: boolean
}

export type ParentSessionDetail = {
  session_id: number
  programme_id: number
  programme_name: string
  programme_description: string | null
  level_name: string | null
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: string | null
  is_cancelled: boolean
  venue: {
    name: string
    address: string | null
    latitude: number | null
    longitude: number | null
  }
  coaches: { coach_id: number; full_name: string }[]
  coach_notes: string | null
  curriculum: { module_id: number; name: string; category: string | null }[]
  children: {
    member_id: number
    full_name: string
    attendance_status: AttendanceStatus | null
    marked_at: string | null
  }[]
  previous_session_id: number | null
  next_session_id: number | null
}

export type ParentAttendanceRow = {
  session_id: number
  programme_name: string
  session_date: string
  start_time: string
  end_time: string
  venue_name: string
  session_status: string | null
  attendance_status: AttendanceStatus
  marked_at: string | null
}

export type ParentAttendanceSummary = {
  member_id: number
  total_marked: number
  present: number
  late: number
  absent: number
  excused: number
  attendance_rate: number | null
}

// ---------- Helpers ----------
export class AccessDeniedError extends Error {}

function toError(message: string): Error {
  return /access denied|not found/i.test(message)
    ? new AccessDeniedError(message)
    : new Error(message)
}

// Local date as YYYY-MM-DD. Do not use toISOString(): in South Africa (UTC+2)
// it can shift the date back a day.
export function toDateParam(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const parentScheduleKeys = {
  all: ["parent-schedule"] as const,
  dashboard: () => [...parentScheduleKeys.all, "dashboard"] as const,
  sessions: (start: string, end: string, memberId: number | null) =>
    [...parentScheduleKeys.all, "sessions", start, end, memberId] as const,
  session: (id: number) => [...parentScheduleKeys.all, "session", id] as const,
  attendance: (memberId: number, start: string | null, end: string | null) =>
    [...parentScheduleKeys.all, "attendance", memberId, start, end] as const,
  attendanceSummary: (memberId: number) =>
    [...parentScheduleKeys.all, "attendance-summary", memberId] as const,
}

// ---------- Hooks ----------

// Dashboard "next session" cards
export function useParentDashboardSummary() {
  return useQuery({
    queryKey: parentScheduleKeys.dashboard(),
    queryFn: async (): Promise<ParentDashboardSummary> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("parent_get_dashboard_summary")
      if (error) throw toError(error.message)
      return data as ParentDashboardSummary
    },
    staleTime: 60_000,
  })
}

// My Schedule: all children, or one when memberId is passed
export function useParentSessions(params: {
  startDate: string
  endDate: string
  memberId?: number | null
}) {
  const { startDate, endDate, memberId = null } = params

  return useQuery({
    queryKey: parentScheduleKeys.sessions(startDate, endDate, memberId),
    queryFn: async (): Promise<ParentSessionRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("parent_get_sessions", {
        p_start_date: startDate,
        p_end_date: endDate,
        p_member_id: memberId,
      })
      if (error) throw toError(error.message)
      return (data ?? []) as ParentSessionRow[]
    },
    enabled: Boolean(startDate && endDate),
    placeholderData: keepPreviousData, // smooth month/week switching
    staleTime: 30_000,
  })
}

// /schedule/[id]
export function useParentSessionDetail(sessionId: number) {
  return useQuery({
    queryKey: parentScheduleKeys.session(sessionId),
    queryFn: async (): Promise<ParentSessionDetail> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("parent_get_session_detail", {
        p_session_id: sessionId,
      })
      if (error) throw toError(error.message)
      return data as ParentSessionDetail
    },
    enabled: Number.isInteger(sessionId) && sessionId > 0,
    retry: (failureCount, error) =>
      !(error instanceof AccessDeniedError) && failureCount < 2,
    staleTime: 30_000,
  })
}

// Child's attendance history tab
export function useParentMemberAttendance(
  memberId: number,
  range?: { startDate?: string; endDate?: string }
) {
  const start = range?.startDate ?? null
  const end = range?.endDate ?? null

  return useQuery({
    queryKey: parentScheduleKeys.attendance(memberId, start, end),
    queryFn: async (): Promise<ParentAttendanceRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "parent_get_member_attendance",
        {
          p_member_id: memberId,
          p_start_date: start,
          p_end_date: end,
        }
      )
      if (error) throw toError(error.message)
      return (data ?? []) as ParentAttendanceRow[]
    },
    enabled: Number.isInteger(memberId) && memberId > 0,
    staleTime: 60_000,
  })
}

// Attendance rate and counts
export function useParentMemberAttendanceSummary(memberId: number) {
  return useQuery({
    queryKey: parentScheduleKeys.attendanceSummary(memberId),
    queryFn: async (): Promise<ParentAttendanceSummary> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "parent_get_member_attendance_summary",
        { p_member_id: memberId }
      )
      if (error) throw toError(error.message)
      return data as ParentAttendanceSummary
    },
    enabled: Number.isInteger(memberId) && memberId > 0,
    staleTime: 60_000,
  })
}
