import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { UserPlus, Pencil, Trash2, type LucideIcon } from "lucide-react"

// ---------- Stats ----------

type OverviewStatsRow = {
  total_accounts: number
  total_accounts_delta_pct: number | null
  active_members: number
  active_members_delta_pct: number | null
  active_coaches: number
  active_coaches_delta: number
  revenue_this_month: number
  revenue_delta_pct: number | null
}

export type StatTileData = {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
}

function formatDelta(pct: number | null) {
  if (pct === null) return { delta: "—", trend: "up" as const }
  return {
    delta: `${pct >= 0 ? "+" : ""}${pct}%`,
    trend: (pct >= 0 ? "up" : "down") as "up" | "down",
  }
}

export function useOverviewStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async (): Promise<StatTileData[]> => {
      const { data, error } = await supabase
        .rpc("admin_report_overview_stats")
        .single<OverviewStatsRow>()
      if (error) throw error

      const coachesDelta = {
        delta: `${data.active_coaches_delta >= 0 ? "+" : ""}${data.active_coaches_delta}`,
        trend: (data.active_coaches_delta >= 0 ? "up" : "down") as
          "up" | "down",
      }

      return [
        {
          label: "Total accounts",
          value: data.total_accounts.toLocaleString(),
          ...formatDelta(data.total_accounts_delta_pct),
        },
        {
          label: "Active members",
          value: data.active_members.toLocaleString(),
          ...formatDelta(data.active_members_delta_pct),
        },
        {
          label: "Active coaches",
          value: data.active_coaches.toLocaleString(),
          ...coachesDelta,
        },
        {
          label: "Revenue this month",
          value: `R${data.revenue_this_month.toLocaleString()}`,
          ...formatDelta(data.revenue_delta_pct),
        },
      ]
    },
  })
}

// ---------- Enrollment Trend ----------

export type EnrollmentTrendPoint = { month: string; enrollments: number }

export function useEnrollmentTrend(months = 6) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-enrollment-trend", months],
    queryFn: async (): Promise<EnrollmentTrendPoint[]> => {
      const { data, error } = await supabase.rpc(
        "admin_report_enrollment_trend",
        { p_months: months }
      )
      if (error) throw error
      return (data as { month_label: string; enrollments: number }[]).map(
        (row) => ({
          month: row.month_label,
          enrollments: Number(row.enrollments),
        })
      )
    },
  })
}

// ---------- Members by Level ----------

export type MembersByLevelPoint = { level: string; count: number }

export function useMembersByLevel() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-members-by-level"],
    queryFn: async (): Promise<MembersByLevelPoint[]> => {
      const { data, error } = await supabase.rpc(
        "admin_report_members_by_level"
      )
      if (error) throw error
      return (data as { level_name: string; member_count: number }[]).map(
        (row) => ({
          level: row.level_name,
          count: Number(row.member_count),
        })
      )
    },
  })
}

// ---------- Revenue by Month ----------

export type RevenueByMonthPoint = { month: string; revenue: number }

export function useRevenueByMonth(months = 12) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-revenue-by-month", months],
    queryFn: async (): Promise<RevenueByMonthPoint[]> => {
      const { data, error } = await supabase.rpc(
        "admin_report_revenue_by_month",
        { p_months: months }
      )
      if (error) throw error
      return (data as { month_label: string; revenue: number }[]).map(
        (row) => ({
          month: row.month_label,
          revenue: Number(row.revenue),
        })
      )
    },
  })
}

// ---------- Revenue by Programme Type ----------

export type RevenueByProgrammePoint = {
  programmeType: string
  totalRevenue: number
}

export function useRevenueByProgrammeType() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-revenue-by-programme-type"],
    queryFn: async (): Promise<RevenueByProgrammePoint[]> => {
      const { data, error } = await supabase.rpc(
        "admin_report_revenue_by_programme_type"
      )
      if (error) throw error
      return (data as { programme_type: string; total_revenue: number }[]).map(
        (row) => ({
          programmeType: row.programme_type,
          totalRevenue: Number(row.total_revenue),
        })
      )
    },
  })
}

// ---------- Attendance by Programme ----------

export type AttendanceReportItem = {
  programmeName: string
  sessionDate: string
  totalMembers: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number | null
}

export function useAttendanceByProgramme(
  programmeId?: number,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient()

  return useQuery({
    queryKey: [
      "admin-attendance-by-programme",
      programmeId,
      startDate,
      endDate,
    ],
    queryFn: async (): Promise<AttendanceReportItem[]> => {
      const params: Record<string, string | number> = {}
      if (programmeId !== undefined && programmeId !== null)
        params.p_programme_id = programmeId
      if (startDate) params.p_start_date = startDate
      if (endDate) params.p_end_date = endDate

      const { data, error } = await supabase.rpc(
        "admin_report_attendance_by_programme",
        params
      )
      if (error) throw error
      return (
        data as {
          programme_name: string
          session_date: string
          total_members: number
          present: number
          absent: number
          late: number
          excused: number
          attendance_rate: number
        }[]
      ).map((row) => ({
        programmeName: row.programme_name,
        sessionDate: row.session_date,
        totalMembers: Number(row.total_members),
        present: Number(row.present),
        absent: Number(row.absent),
        late: Number(row.late),
        excused: Number(row.excused),
        attendanceRate: row.attendance_rate,
      }))
    },
  })
}

// ---------- Revenue by Period ----------

export type RevenueByPeriodItem = {
  periodLabel: string
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  paymentCount: number
}

export function useRevenueByPeriod(
  period: "day" | "week" | "month" | "quarter" | "year" = "month",
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-revenue-by-period", period, startDate, endDate],
    queryFn: async (): Promise<RevenueByPeriodItem[]> => {
      const params: Record<string, string | number> = { p_period: period }
      if (startDate) params.p_start_date = startDate
      if (endDate) params.p_end_date = endDate

      const { data, error } = await supabase.rpc(
        "admin_report_revenue_by_period",
        params
      )
      if (error) throw error
      return (
        data as {
          period_label: string
          total_invoices: number
          total_amount: number
          paid_amount: number
          outstanding_amount: number
          payment_count: number
        }[]
      ).map((row) => ({
        periodLabel: row.period_label,
        totalInvoices: Number(row.total_invoices),
        totalAmount: Number(row.total_amount),
        paidAmount: Number(row.paid_amount),
        outstandingAmount: Number(row.outstanding_amount),
        paymentCount: Number(row.payment_count),
      }))
    },
  })
}

// ---------- Progression Summary ----------

export type ProgressionItem = {
  memberName: string
  currentLevel: string
  fromLevel: string
  toLevel: string
  progressionDate: string
  badgeComplete: boolean
  assessedBy: string | null
  notes: string | null
}

export function useProgressionSummary(
  levelId?: number,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-progression-summary", levelId, startDate, endDate],
    queryFn: async (): Promise<ProgressionItem[]> => {
      const params: Record<string, string | number> = {}
      if (levelId !== undefined && levelId !== null) params.p_level_id = levelId
      if (startDate) params.p_start_date = startDate
      if (endDate) params.p_end_date = endDate

      const { data, error } = await supabase.rpc(
        "admin_report_progression_summary",
        params
      )
      if (error) throw error
      return (
        data as {
          member_name: string
          current_level: string
          from_level: string
          to_level: string
          progression_date: string
          badge_complete: boolean
          assessed_by: string | null
          notes: string | null
        }[]
      ).map((row) => ({
        memberName: row.member_name,
        currentLevel: row.current_level,
        fromLevel: row.from_level,
        toLevel: row.to_level,
        progressionDate: row.progression_date,
        badgeComplete: row.badge_complete,
        assessedBy: row.assessed_by,
        notes: row.notes,
      }))
    },
  })
}

// ---------- Capacity Utilisation ----------

export type CapacityUtilisationItem = {
  programmeName: string
  capacity: number
  enrolled: number
  utilisationRate: number | null
  coachCount: number
  maxRatio: number | null
  currentRatio: number | null
  ratioStatus: string
}

export function useCapacityUtilisation(programmeId?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-capacity-utilisation", programmeId],
    queryFn: async (): Promise<CapacityUtilisationItem[]> => {
      const params: Record<string, string | number> = {}
      if (programmeId !== undefined && programmeId !== null) {
        params.p_programme_id = programmeId
      }

      const { data, error } = await supabase.rpc(
        "admin_report_capacity_utilisation",
        params
      )
      if (error) throw error
      return (
        data as {
          programme_name: string
          capacity: number
          enrolled: number
          utilisation_rate: number
          coach_count: number
          max_ratio: number
          current_ratio: number
          ratio_status: string
        }[]
      ).map((row) => ({
        programmeName: row.programme_name,
        capacity: Number(row.capacity),
        enrolled: Number(row.enrolled),
        utilisationRate: row.utilisation_rate,
        coachCount: Number(row.coach_count),
        maxRatio: row.max_ratio,
        currentRatio: row.current_ratio,
        ratioStatus: row.ratio_status,
      }))
    },
  })
}

// ---------- Member Attendance Summary ----------

export type MemberAttendanceItem = {
  memberName: string
  programmeName: string
  totalSessions: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number | null
}

export function useMemberAttendance(memberId?: number, programmeId?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-member-attendance", memberId, programmeId],
    queryFn: async (): Promise<MemberAttendanceItem[]> => {
      const params: Record<string, string | number> = {}
      if (memberId !== undefined && memberId !== null)
        params.p_member_id = memberId
      if (programmeId !== undefined && programmeId !== null)
        params.p_programme_id = programmeId

      const { data, error } = await supabase.rpc(
        "admin_report_member_attendance",
        params
      )
      if (error) throw error
      return (
        data as {
          member_name: string
          programme_name: string
          total_sessions: number
          present: number
          absent: number
          late: number
          excused: number
          attendance_rate: number
        }[]
      ).map((row) => ({
        memberName: row.member_name,
        programmeName: row.programme_name,
        totalSessions: Number(row.total_sessions),
        present: Number(row.present),
        absent: Number(row.absent),
        late: Number(row.late),
        excused: Number(row.excused),
        attendanceRate: row.attendance_rate,
      }))
    },
  })
}

// ---------- Recent Activity ----------

export type ActivityItem = {
  id: string
  icon: LucideIcon
  title: string
  detail: string
  time: string
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  insert: UserPlus,
  update: Pencil,
  delete: Trash2,
}

const TABLE_LABELS: Record<string, string> = {
  accounts: "account",
  members: "member",
  coaches: "coach",
  programmes: "programme",
  enrollments: "enrollment",
  invoices: "invoice",
  payments: "payment",
  level_progressions: "level progression",
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function describeAction(action: string, tableLabel: string) {
  if (action === "insert") return `New ${tableLabel} created`
  if (action === "delete") return `${tableLabel} deleted`
  return `${tableLabel} updated`
}

export function useRecentActivity(limit = 10) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-recent-activity", limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      const params: Record<string, string | number> = {}
      if (limit !== undefined && limit !== null) {
        params.p_limit = limit
      }

      const { data, error } = await supabase.rpc(
        "admin_report_recent_activity",
        params
      )
      if (error) throw error

      return (
        data as {
          id: number
          actor_name: string | null
          action: string
          table_name: string
          record_id: string
          created_at: string
        }[]
      ).map((row) => {
        const tableLabel = TABLE_LABELS[row.table_name] ?? row.table_name
        return {
          id: String(row.id),
          icon: ACTION_ICONS[row.action] ?? Pencil,
          title: describeAction(row.action, tableLabel).replace(/^\w/, (c) =>
            c.toUpperCase()
          ),
          detail: `${row.actor_name ?? "System"} · #${row.record_id}`,
          time: timeAgo(row.created_at),
        }
      })
    },
  })
}
