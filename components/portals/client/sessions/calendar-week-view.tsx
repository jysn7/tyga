"use client"

import { format, isToday } from "date-fns"
import { KIND_STYLES, eventHref, getSessionsForDay } from "@/lib/schedule"
import { EventLink } from "@/components/portals/client/sessions/event-link"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export function CalendarWeekView({
  days,
  sessions,
}: {
  days: Date[]
  sessions: SessionEvent[]
}) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => {
        const daySessions = getSessionsForDay(sessions, day)
        const today = isToday(day)

        return (
          <div key={day.toISOString()} className="flex flex-col gap-2">
            {/* Day header */}
            <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <span
                className={`text-sm ${
                  today ? "font-semibold text-primary" : "text-muted-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-1.5">
              {daySessions.length === 0 ? (
                <span className="py-1 text-xs text-muted-foreground/50">—</span>
              ) : (
                daySessions.map((s) => {
                  const cancelled = s.status === "cancelled"
                  const detail = [s.programmeName, s.memberName]
                    .filter(Boolean)
                    .join(" · ")
                  const kindStyle = KIND_STYLES[s.kind]

                  return (
                    <EventLink
                      key={`${s.kind}-${s.id}`}
                      href={eventHref(s)}
                      ariaLabel={`${kindStyle.label} at ${s.startTime}: ${detail}`}
                      className={`flex flex-col gap-1 rounded-lg border border-border/60 bg-card p-2 text-left shadow-sm transition-colors hover:border-border hover:bg-accent/40 ${
                        cancelled ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindStyle.dot}`}
                        />
                        <span
                          className={`text-xs font-medium text-foreground ${
                            cancelled ? "line-through" : ""
                          }`}
                        >
                          {s.startTime}
                        </span>
                      </div>
                      <span
                        className={`truncate text-xs ${
                          cancelled
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {detail}
                      </span>
                    </EventLink>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
