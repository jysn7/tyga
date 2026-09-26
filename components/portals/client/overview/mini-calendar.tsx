"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
} from "lucide-react"
import type { UpcomingSession } from "@/hooks/client/use-parent-overview"

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"]

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function parseSessionDate(
  session: UpcomingSession,
  refYear: number
): Date | null {
  const match = session.date.match(/(\d+)\s+(\w+)/)
  if (!match) return null
  const day = Number(match[1])
  const monthShort = match[2]
  const monthIndex = new Date(`${monthShort} 1, ${refYear}`).getMonth()
  if (Number.isNaN(monthIndex)) return null
  return new Date(refYear, monthIndex, day)
}

function getWeekAround(date: Date): Date[] {
  const monday = new Date(date)
  const day = (monday.getDay() + 6) % 7 // 0 = Monday
  monday.setDate(monday.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [breakpoint])
  return isMobile
}

export function MiniCalendar({
  sessions = [],
}: {
  sessions?: UpcomingSession[]
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  // Mobile-only: which week to show (offset in weeks from current week)
  const [weekOffset, setWeekOffset] = useState(0)
  const isMobile = useIsMobile()

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month

  const weeks = buildMonthGrid(year, month)
  const monthLabel = cursor.toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  })

  const sessionsByDay = new Map<number, UpcomingSession[]>()
  for (const s of sessions) {
    const d = parseSessionDate(s, year)
    if (!d) continue
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    const key = d.getDate()
    const arr = sessionsByDay.get(key) ?? []
    arr.push(s)
    sessionsByDay.set(key, arr)
  }

  const monthCount = Array.from(sessionsByDay.values()).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  // Mobile: build week-of-interest label
  const weekDays = getWeekAround(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + weekOffset * 7
    )
  )
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]
  const weekLabel =
    weekOffset === 0
      ? "This week"
      : weekOffset === -1
        ? "Last week"
        : weekOffset === 1
          ? "Next week"
          : `${weekStart.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`

  function goMonth(delta: number) {
    setCursor(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    )
  }

  function goWeek(delta: number) {
    setWeekOffset((prev) => prev + delta)
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {isMobile ? weekLabel : monthLabel}
          </h2>
          <span className="truncate text-[11px] text-muted-foreground">
            {isMobile
              ? weekStart.toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : monthCount === 0
                ? "No sessions scheduled"
                : `${monthCount} session${monthCount === 1 ? "" : "s"} this month`}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => (isMobile ? goWeek(-1) : goMonth(-1))}
            title={isMobile ? "Previous week" : "Previous month"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => (isMobile ? goWeek(1) : goMonth(1))}
            title={isMobile ? "Next week" : "Next month"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Mobile: single-week strip with pager */}
      {isMobile ? (
        <WeekStrip weekStart={weekStart} sessions={sessions} today={today} />
      ) : (
        <>
          {/* Weekday header */}
          <div className="mt-5 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <span
                key={i}
                className="flex h-6 items-center justify-center text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="mt-1 flex flex-col gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (day === null) return <span key={di} className="h-8" />

                  const daySessions = sessionsByDay.get(day) ?? []
                  const hasSessions = daySessions.length > 0
                  const isToday = isCurrentMonth && day === today.getDate()
                  const isPast = isCurrentMonth && day < today.getDate()

                  return (
                    <div key={di} className="group relative">
                      <button
                        type="button"
                        className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          isToday
                            ? "bg-foreground text-background"
                            : hasSessions
                              ? "bg-blue/15 text-foreground hover:bg-blue/25"
                              : isPast
                                ? "text-muted-foreground/40"
                                : "text-foreground/70 hover:bg-accent"
                        }`}
                      >
                        {day}
                        {hasSessions && (
                          <span
                            className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                              isToday ? "bg-background" : "bg-blue"
                            }`}
                          />
                        )}
                      </button>

                      {/* Hover tooltip */}
                      {hasSessions && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute top-full left-1/2 z-30 mt-1.5 hidden w-56 -translate-x-1/2 rounded-lg border border-border/60 bg-popover p-3 shadow-lg sm:block sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                              {daySessions.length} session
                              {daySessions.length === 1 ? "" : "s"}
                            </span>
                            <div className="flex flex-col divide-y divide-border/60">
                              {daySessions.slice(0, 3).map((s) => (
                                <div
                                  key={s.id}
                                  className="flex flex-col gap-1 py-1.5 first:pt-0 last:pb-0"
                                >
                                  <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <User
                                      className="h-3 w-3 shrink-0 text-muted-foreground"
                                      strokeWidth={1.75}
                                    />
                                    <span className="truncate">
                                      {s.childName}
                                    </span>
                                  </span>
                                  <span className="truncate text-[11px] text-muted-foreground">
                                    {s.programmeName}
                                  </span>
                                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock
                                        className="h-3 w-3 shrink-0"
                                        strokeWidth={1.75}
                                      />
                                      {s.time || "—"}
                                    </span>
                                    {s.venue && (
                                      <span className="flex min-w-0 items-center gap-1">
                                        <MapPin
                                          className="h-3 w-3 shrink-0"
                                          strokeWidth={1.75}
                                        />
                                        <span className="truncate">
                                          {s.venue}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {daySessions.length > 3 && (
                              <span className="text-[11px] text-muted-foreground">
                                +{daySessions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 h-px bg-border/60" />

      <Link
        href="/schedule"
        className="group/cta mt-4 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-foreground text-xs font-medium text-background transition-colors hover:bg-foreground/90"
      >
        View full schedule
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5"
          strokeWidth={1.75}
        />
      </Link>
    </section>
  )
}

function WeekStrip({
  weekStart,
  sessions,
  today,
}: {
  weekStart: Date
  sessions: UpcomingSession[]
  today: Date
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  // Count sessions per day for this specific week
  const countsByYMD = new Map<string, number>()
  for (const s of sessions) {
    const parsed = parseSessionDate(s, weekStart.getFullYear())
    if (!parsed) continue
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`
    countsByYMD.set(key, (countsByYMD.get(key) ?? 0) + 1)
  }

  return (
    <div className="mt-4">
      {/* Weekday header row */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="flex h-5 items-center justify-center text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day tiles */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
          const count = countsByYMD.get(key) ?? 0
          const isToday = d.toDateString() === today.toDateString()
          const isPast = d < today && !isToday

          return (
            <div
              key={i}
              className={`relative flex h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors ${
                isToday
                  ? "bg-foreground text-background"
                  : count > 0
                    ? "bg-blue/15 text-foreground"
                    : isPast
                      ? "text-muted-foreground/30"
                      : "text-foreground/70"
              }`}
            >
              <span className="leading-none">{d.getDate()}</span>
              {count > 0 && (
                <span className="flex gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <span
                      key={j}
                      className={`h-1 w-1 rounded-full ${
                        isToday ? "bg-background" : "bg-blue"
                      }`}
                    />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
