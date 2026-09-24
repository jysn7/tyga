"use client"

import Link from "next/link"
import { ChevronRight, MapPin } from "lucide-react"
import type { UpcomingSession } from "@/hooks/client/use-parent-overview"

export function UpcomingSessionsList({
  sessions,
}: {
  sessions: UpcomingSession[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-foreground">
          Upcoming sessions
        </h2>
        <Link
          href="/schedule"
          className="flex items-center gap-1 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-2xl bg-card py-10 text-center text-sm text-muted-foreground shadow">
          No upcoming sessions
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card px-4 shadow">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-4">
              <div className="flex w-20 shrink-0 flex-col">
                <span className="text-xs font-semibold text-foreground">
                  {s.date.split(",")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {s.date.split(",")[1]}
                </span>
              </div>

              <div className="h-8 w-px shrink-0 bg-blue/40" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {s.programmeName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{s.childName}</span>
                  <span>·</span>
                  <span>{s.time}</span>
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-pink/15 px-2.5 py-1 text-xs text-pink sm:flex">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{s.venue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
