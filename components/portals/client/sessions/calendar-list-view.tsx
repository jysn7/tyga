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
          className="border-b border-border/60 py-3 last:border-b-0"
        >
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {format(parseISO(date), "EEEE, MMMM d")}
          </span>
          <div className="mt-2 flex flex-col gap-1">
            {daySessions.map((s) => {
              const cancelled = s.status === "cancelled"
              const sub = [s.memberName, s.venueName]
                .filter(Boolean)
                .join(" · ")

              return (
                <EventLink
                  key={`${s.kind}-${s.id}`}
                  href={eventHref(s)}
                  className={`flex items-center justify-between rounded-md px-1.5 py-2 text-left transition-colors hover:bg-accent/40 ${
                    cancelled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_STYLES[s.kind].dot}`}
                    />
                    <div>
                      <p
                        className={`text-[15px] text-foreground ${
                          cancelled ? "line-through" : ""
                        }`}
                      >
                        {s.programmeName}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {KIND_STYLES[s.kind].label}
                          {cancelled ? " (cancelled)" : ""}
                        </span>
                      </p>
                      {sub && (
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
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
