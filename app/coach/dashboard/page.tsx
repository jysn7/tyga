"use client"

import { useState } from "react"
import Link from "next/link"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday,
  isPast,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
} from "date-fns"
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  TrendingUp,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { StatTile } from "@/components/portals/client/overview/stat-tile"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import {
  useCoachSessions,
  type CoachSession,
} from "@/hooks/coach/use-coach-sessions"

// ---------------------------------------------------------------------------
// Status logic
// ---------------------------------------------------------------------------

function getStatusLine(s: CoachSession): {
  label: string
  variant: StatusVariant
} {
  if (s.status === "cancelled") {
    return { label: "Cancelled", variant: "neutral" }
  }

  const attendanceMissing = s.attendance_count < s.enrolled_count

  if (
    attendanceMissing &&
    isPast(new Date(s.session_date)) &&
    !isToday(new Date(s.session_date))
  ) {
    return { label: "Attendance overdue", variant: "danger" }
  }
  if (attendanceMissing && isToday(new Date(s.session_date))) {
    return { label: "Mark attendance", variant: "warning" }
  }
  if (attendanceMissing) {
    return { label: "Attendance pending", variant: "warning" }
  }
  if (!s.notes_present && isPast(new Date(s.session_date))) {
    return { label: "No notes", variant: "neutral" }
  }
  return { label: "Complete", variant: "success" }
}

// ---------------------------------------------------------------------------
// Week strip — matches MiniCalendar's visual language
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

function WeekStrip({
  cursor,
  onCursorChange,
  sessions,
  selectedDate,
  onSelectDate,
}: {
  cursor: Date
  onCursorChange: (d: Date) => void
  sessions: CoachSession[]
  selectedDate: Date
  onSelectDate: (d: Date) => void
}) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  function countSessions(day: Date) {
    return sessions.filter((s) => isSameDay(new Date(s.session_date), day))
      .length
  }

  const weekLabel =
    isSameMonth(weekStart, today) && isSameMonth(weekEnd, today)
      ? "This week"
      : `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM")}`

  const weekCount = sessions.filter((s) =>
    days.some((d) => isSameDay(new Date(s.session_date), d))
  ).length

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      {/* Header — mirrors MiniCalendar */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {weekLabel}
          </h2>
          <span className="truncate text-[11px] text-muted-foreground">
            {weekCount === 0
              ? "No sessions scheduled"
              : `${weekCount} session${weekCount === 1 ? "" : "s"} this week`}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onCursorChange(subWeeks(cursor, 1))}
            title="Previous week"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(addWeeks(cursor, 1))}
            title="Next week"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d, i) => (
          <span
            key={i}
            className="flex h-6 items-center justify-center text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day tiles */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = countSessions(day)
          const hasSessions = count > 0
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)
          const past = isPast(day) && !today

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-colors ${
                today
                  ? "bg-foreground text-background"
                  : selected
                    ? "bg-blue/25 text-foreground"
                    : hasSessions
                      ? "bg-blue/15 text-foreground hover:bg-blue/25"
                      : past
                        ? "text-muted-foreground/40"
                        : "text-foreground/70 hover:bg-accent"
              }`}
            >
              {format(day, "d")}
              {hasSessions && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    today ? "bg-background" : "bg-blue"
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Session card
// ---------------------------------------------------------------------------

function SessionCard({
  session,
  hero = false,
}: {
  session: CoachSession
  hero?: boolean
}) {
  const status = getStatusLine(session)
  const today = isToday(new Date(session.session_date))

  return (
    <Link
      href={`/coach/dashboard/${session.session_id}`}
      className={`group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow ${
        hero ? "ring-1 ring-rose/60" : ""
      }`}
    >
      {hero && (
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
          </span>
          Starting soon
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {session.programme_name}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              {session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{session.venue_name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              {session.enrolled_count} enrolled
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {today && (
            <span className="rounded bg-green-light px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              Today
            </span>
          )}
          <ChevronRight
            className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            strokeWidth={1.75}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <StatusPill label={status.label} variant={status.variant} />
        <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
          Open session →
        </span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CoachSessionsPage() {
  const [weekCursor, setWeekCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const weekStart = startOfWeek(weekCursor, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekCursor, { weekStartsOn: 1 })

  const { data: weekSessions, isLoading: weekLoading } = useCoachSessions(
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  )

  // Separate query for the last 30 days so "needs attention" can look further back
  const thirtyDaysAgo = addDays(new Date(), -30)
  const { data: recentSessions } = useCoachSessions(
    format(thirtyDaysAgo, "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd")
  )

  const allSessions = weekSessions ?? []

  const todaySessions = allSessions
    .filter((s) => isSameDay(new Date(s.session_date), new Date()))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const selectedDaySessions = allSessions
    .filter((s) => isSameDay(new Date(s.session_date), selectedDate))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  // Stats
  const weekCount = allSessions.length
  const todayCount = todaySessions.length

  const needsAttention = (recentSessions ?? []).filter((s) => {
    const d = new Date(s.session_date)
    const isPastSession = isPast(d) && !isToday(d)
    const attendanceMissing = s.attendance_count < s.enrolled_count
    return s.status !== "cancelled" && isPastSession && attendanceMissing
  })

  const markedSessions = (recentSessions ?? []).filter(
    (s) => s.status !== "cancelled" && s.attendance_count >= s.enrolled_count
  )
  const attendanceRate =
    recentSessions && recentSessions.length > 0
      ? Math.round((markedSessions.length / recentSessions.length) * 100)
      : 0

  // Hero — session starting within the next 2 hours
  const heroSession = todaySessions.find((s) => {
    const now = new Date()
    const [h, m] = s.start_time.split(":").map(Number)
    const start = new Date(s.session_date)
    start.setHours(h, m, 0, 0)
    const diff = start.getTime() - now.getTime()
    return diff > 0 && diff < 2 * 60 * 60 * 1000
  })

  const isSelectedToday = isSameDay(selectedDate, new Date())
  const rightColumnSessions = isSelectedToday
    ? todaySessions
    : selectedDaySessions
  const rightColumnLabel = isSelectedToday
    ? "Today"
    : format(selectedDate, "EEEE, d MMM")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sessions" description="Your assigned sessions" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="This week"
              value={String(weekCount)}
              icon={CalendarDays}
              color="blue"
            />
            <StatTile
              label="Today"
              value={String(todayCount)}
              icon={CalendarClock}
              color={todayCount > 0 ? "orange" : "green"}
            />
            <StatTile
              label="Needs marking"
              value={String(needsAttention.length)}
              icon={AlertCircle}
              color={needsAttention.length > 0 ? "red" : "green"}
            />
            <StatTile
              label="Attendance"
              value={`${attendanceRate}%`}
              icon={TrendingUp}
              color="teal"
            />
          </div>

          {/* Week strip — matches MiniCalendar */}
          <WeekStrip
            cursor={weekCursor}
            onCursorChange={setWeekCursor}
            sessions={allSessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Needs attention */}
          {needsAttention.length > 0 && (
            <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <AlertCircle
                  className="h-3.5 w-3.5 text-destructive"
                  strokeWidth={1.75}
                />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Needs attention
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Past sessions with unmarked attendance
              </p>

              <div className="mt-3 flex flex-col divide-y divide-border/60">
                {needsAttention.slice(0, 5).map((s) => (
                  <Link
                    key={s.session_id}
                    href={`/coach/dashboard/${s.session_id}?focus=attendance`}
                    className="group flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-xs font-medium text-foreground">
                        {s.programme_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(s.session_date), "EEE d MMM")} ·{" "}
                        {s.attendance_count}/{s.enrolled_count} marked
                      </span>
                    </div>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                      strokeWidth={1.75}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Hero */}
          {heroSession && <SessionCard session={heroSession} hero />}

          {/* Selected day */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {rightColumnLabel}
              </h2>
              {isSelectedToday && (
                <span className="text-[11px] text-muted-foreground">
                  {rightColumnSessions.length} session
                  {rightColumnSessions.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {weekLoading ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
                <Loader />
              </div>
            ) : rightColumnSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-8 text-center shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-input">
                  <CheckCircle2
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    No sessions
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Nothing scheduled for this day.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rightColumnSessions.map((s) => (
                  <SessionCard key={s.session_id} session={s} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
