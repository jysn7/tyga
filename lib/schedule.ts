import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export type ViewMode = "month" | "week" | "list"

// ---------- Status → visual mapping ----------

export function dotColor(status: SessionEvent["status"]) {
  if (status === "completed") return "bg-primary"
  if (status === "cancelled") return "bg-destructive"
  return "bg-muted-foreground"
}

// ---------- Session lookups ----------

export function getSessionsForDay(sessions: SessionEvent[], day: Date) {
  return sessions
    .filter((s) => isSameDay(new Date(s.date), day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function groupSessionsByDate(sessions: SessionEvent[]) {
  const sorted = [...sessions].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  )
  const grouped = new Map<string, SessionEvent[]>()
  for (const s of sorted) {
    if (!grouped.has(s.date)) grouped.set(s.date, [])
    grouped.get(s.date)!.push(s)
  }
  return Array.from(grouped.entries())
}

// ---------- Date range calculation per view ----------

export function getVisibleDays(view: ViewMode, cursorDate: Date) {
  if (view === "month") {
    const start = startOfWeek(startOfMonth(cursorDate))
    const end = endOfWeek(endOfMonth(cursorDate))
    return eachDayOfInterval({ start, end })
  }
  if (view === "week") {
    const start = startOfWeek(cursorDate)
    const end = endOfWeek(cursorDate)
    return eachDayOfInterval({ start, end })
  }
  return []
}

// ---------- Navigation ----------

export function getPrevDate(view: ViewMode, cursorDate: Date) {
  if (view === "month") return subMonths(cursorDate, 1)
  if (view === "week") return subWeeks(cursorDate, 1)
  return addDays(cursorDate, -30)
}

export function getNextDate(view: ViewMode, cursorDate: Date) {
  if (view === "month") return addMonths(cursorDate, 1)
  if (view === "week") return addWeeks(cursorDate, 1)
  return addDays(cursorDate, 30)
}

// ---------- Header label ----------

export function getHeaderLabel(view: ViewMode, cursorDate: Date) {
  if (view === "month") return format(cursorDate, "MMMM yyyy")
  if (view === "week") {
    const start = startOfWeek(cursorDate)
    const end = endOfWeek(cursorDate)
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
  }
  return "All upcoming sessions"
}
