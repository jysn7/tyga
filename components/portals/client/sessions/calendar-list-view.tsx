"use client"

import { format, parseISO } from "date-fns"
import { KIND_STYLES, eventHref, groupSessionsByDate } from "@/lib/schedule"
import { EventLink } from "@/components/portals/client/sessions/event-link"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export function CalendarListView({ sessions }: { sessions: SessionEvent[] }) {
  const grouped = groupSessionsByDate(sessions)

  return (
    <div className="flex flex-col">
      {grouped.map(([date, daySessions]) => (
        <div
          key={date}
          className="flex flex-col gap-2 border-b border-border/60 py-4 first:pt-0 last:border-b-0 last:pb-0"
        >
          {/* Date header */}
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {format(parseISO(date), "EEEE, d MMMM")}
          </span>

          {/* Sessions */}
          <div className="flex flex-col gap-1">
            {daySessions.map((s) => {
              const cancelled = s.status === "cancelled"
              const sub = [s.memberName, s.venueName]
                .filter(Boolean)
                .join(" · ")
              const kindStyle = KIND_STYLES[s.kind]

              return (
                <EventLink
                  key={`${s.kind}-${s.id}`}
                  href={eventHref(s)}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-accent/40 ${
                    cancelled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindStyle.dot}`}
                    />

                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`truncate text-sm text-foreground ${
                            cancelled ? "line-through" : ""
                          }`}
                        >
                          {s.programmeName}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {kindStyle.label}
                          {cancelled ? " · cancelled" : ""}
                        </span>
                      </div>

                      {sub && (
                        <span className="truncate text-xs text-muted-foreground">
                          {sub}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {s.startTime}
                  </span>
                </EventLink>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
