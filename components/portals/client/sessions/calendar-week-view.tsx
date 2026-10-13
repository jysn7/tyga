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
                daySessions.map((s) => {
                  const cancelled = s.status === "cancelled"
                  const detail = [s.programmeName, s.memberName]
                    .filter(Boolean)
                    .join(" · ")

                  return (
                    <EventLink
                      key={`${s.kind}-${s.id}`}
                      href={eventHref(s)}
                      ariaLabel={`${KIND_STYLES[s.kind].label} at ${s.startTime}: ${detail}`}
                      className={`flex flex-col gap-0.5 rounded-md bg-blue p-2 text-left transition-colors hover:bg-accent/60 ${
                        cancelled ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_STYLES[s.kind].dot}`}
                        />
                        <span
                          className={`text-xs font-medium text-primary-foreground ${
                            cancelled ? "line-through" : ""
                          }`}
                        >
                          {s.startTime}
                        </span>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
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
