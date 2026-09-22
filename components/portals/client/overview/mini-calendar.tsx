"use client"

import { useState } from "react"
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

export function MiniCalendar({
  sessions = [],
}: {
  sessions?: UpcomingSession[]
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

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

  function goMonth(delta: number) {
    setCursor(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    )
  }

  return (
    <section className="relative isolate overflow-hidden rounded-xl bg-yellow p-5 shadow">
      {/* Decorative shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Large soft circle top-right */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-yellow-foreground/[0.06]" />

        {/* Smaller circle bottom-left */}
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-yellow-foreground/[0.08]" />

        {/* Blurred blob top-left */}
        <div className="absolute top-16 -left-16 h-32 w-32 rounded-full bg-yellow-foreground/[0.05] blur-2xl" />

        {/* Thin ring bottom-right */}
        <div className="absolute right-8 -bottom-16 h-36 w-36 rounded-full border border-yellow-foreground/10" />

        {/* Diagonal stripe accent */}
        <div className="absolute top-6 right-6 h-16 w-16 rotate-12 rounded-2xl bg-yellow-foreground/[0.04]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-sm font-semibold tracking-tight text-yellow-foreground">
            {monthLabel}
          </h2>
          <span className="truncate text-xs text-yellow-foreground/70">
            {monthCount === 0
              ? "No sessions"
              : `${monthCount} session${monthCount === 1 ? "" : "s"} this month`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            title="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-yellow-foreground/70 transition-colors hover:bg-yellow-foreground/10 hover:text-yellow-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            title="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-yellow-foreground/70 transition-colors hover:bg-yellow-foreground/10 hover:text-yellow-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="relative mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="flex h-6 items-center justify-center text-[10px] font-medium tracking-wider text-yellow-foreground/60 uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="relative mt-1 flex flex-col gap-1">
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
                        ? "bg-yellow-foreground text-yellow"
                        : hasSessions
                          ? "bg-foreground text-card shadow hover:bg-yellow-foreground/25"
                          : isPast
                            ? "text-yellow-foreground/40"
                            : "text-yellow-foreground/70 hover:bg-yellow-foreground/10 hover:text-yellow-foreground"
                    }`}
                  >
                    {day}
                    {hasSessions && (
                      <span
                        className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                          isToday ? "bg-yellow" : "bg-yellow-foreground/60"
                        }`}
                      />
                    )}
                  </button>

                  {/* Hover tooltip */}
                  {hasSessions && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute top-full left-1/2 z-30 mt-1.5 w-56 -translate-x-1/2 rounded-lg border border-border/60 bg-popover p-3 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            {daySessions.length} session
                            {daySessions.length === 1 ? "" : "s"}
                          </span>
                        </div>

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
                                <span className="truncate">{s.childName}</span>
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
                                    <span className="truncate">{s.venue}</span>
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

      <div className="relative mt-4 h-px bg-yellow-foreground/15" />

      <Link
        href="/schedule"
        className="relative mt-4 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-card bg-card text-xs font-medium text-foreground transition-colors duration-300 hover:bg-yellow hover:text-card"
      >
        View full schedule
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    </section>
  )
}
