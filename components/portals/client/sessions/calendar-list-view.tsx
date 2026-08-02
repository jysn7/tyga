"use client"

import { format } from "date-fns"
import { dotColor, groupSessionsByDate } from "@/lib/schedule"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export function CalendarListView({
  sessions,
  onSelectSession,
}: {
  sessions: SessionEvent[]
  onSelectSession: (session: SessionEvent) => void
}) {
  const grouped = groupSessionsByDate(sessions)

  return (
    <div className="flex flex-col">
      {grouped.map(([date, daySessions]) => (
        <div
          key={date}
          className="border-b border-border/60 py-3 last:border-b-0"
        >
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {format(new Date(date), "EEEE, MMMM d")}
          </span>
          <div className="mt-2 flex flex-col gap-1">
            {daySessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                className="flex items-center justify-between rounded-md px-1.5 py-2 text-left transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(s.status)}`}
                  />
                  <div>
                    <p className="text-[15px] text-foreground">
                      {s.programmeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.memberName} · {s.venueName}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {s.startTime}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
