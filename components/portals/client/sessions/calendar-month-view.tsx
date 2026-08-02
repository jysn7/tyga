"use client"

import { format, isSameMonth, isToday } from "date-fns"
import { getSessionsForDay } from "@/lib/schedule"
import { SessionPill } from "@/components/portals/client/sessions/session-pill"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarMonthView({
  days,
  cursorDate,
  sessions,
  onSelectSession,
}: {
  days: Date[]
  cursorDate: Date
  sessions: SessionEvent[]
  onSelectSession: (session: SessionEvent) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div className="grid grid-cols-7 border-b border-border/60">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="border-r border-border/60 px-2 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const daySessions = getSessionsForDay(sessions, day)
          const inMonth = isSameMonth(day, cursorDate)

          return (
            <div
              key={day.toISOString()}
              className="flex min-h-24 flex-col gap-0.5 border-r border-b border-border/60 p-1.5 last:border-r-0"
            >
              <span
                className={`text-xs ${
                  isToday(day)
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5">
                {daySessions.slice(0, 3).map((s) => (
                  <SessionPill
                    key={s.id}
                    session={s}
                    onClick={() => onSelectSession(s)}
                  />
                ))}
                {daySessions.length > 3 && (
                  <span className="px-1.5 text-xs text-muted-foreground">
                    +{daySessions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
