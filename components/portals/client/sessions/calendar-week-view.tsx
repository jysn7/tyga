"use client"

import { format, isToday } from "date-fns"
import { dotColor, getSessionsForDay } from "@/lib/schedule"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export function CalendarWeekView({
  days,
  sessions,
  onSelectSession,
}: {
  days: Date[]
  sessions: SessionEvent[]
  onSelectSession: (session: SessionEvent) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => {
        const daySessions = getSessionsForDay(sessions, day)

        return (
          <div key={day.toISOString()} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <span className="text-xs tracking-wide text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <span
                className={`text-sm ${isToday(day) ? "font-medium text-primary" : "text-muted-foreground"}`}
              >
                {format(day, "d")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {daySessions.length === 0 ? (
                <span className="text-xs text-muted-foreground/50">—</span>
              ) : (
                daySessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSession(s)}
                    className="flex flex-col gap-0.5 rounded-md bg-blue p-2 text-left transition-colors hover:bg-accent/60"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(s.status)}`}
                      />
                      <span className="text-xs font-medium text-primary-foreground">
                        {s.startTime}
                      </span>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {s.memberName}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
