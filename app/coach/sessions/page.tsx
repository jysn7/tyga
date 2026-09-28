"use client"

import { useState } from "react"
import Link from "next/link"
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns"
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import { useCoachSessions } from "@/hooks/coach/use-coach-sessions"

export default function CoachSessionsPage() {
  const [cursor, setCursor] = useState(new Date())
  const start = format(startOfMonth(cursor), "yyyy-MM-dd")
  const end = format(endOfMonth(cursor), "yyyy-MM-dd")

  const { data: sessions, isLoading } = useCoachSessions(start, end)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sessions"
        description="Your assigned sessions this month"
      />

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor((d) => subMonths(d, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
          <span className="min-w-[140px] text-sm font-medium text-foreground">
            {format(cursor, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCursor(new Date())}
          className="h-8 text-xs"
        >
          Today
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <CalendarDays
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              No sessions this month
            </span>
            <span className="text-xs text-muted-foreground">
              Try a different month or check back later.
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {sessions.map((s) => (
              <Link
                key={s.session_id}
                href={`/coach/sessions/${s.session_id}`}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
              >
                {/* Date block */}
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-input">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {format(new Date(s.session_date), "MMM")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {format(new Date(s.session_date), "d")}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {s.programme_name}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                      {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{s.venue_name}</span>
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex items-center gap-1 rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Users className="h-3 w-3" strokeWidth={1.75} />
                    {s.enrolled_count}
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
