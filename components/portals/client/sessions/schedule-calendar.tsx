"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  getHeaderLabel,
  getNextDate,
  getPrevDate,
  getVisibleDays,
  type ViewMode,
  type EventKind,
} from "@/lib/schedule"
import { CalendarMonthView } from "@/components/portals/client/sessions/calendar-month-view"
import { CalendarWeekView } from "@/components/portals/client/sessions/calendar-week-view"
import { CalendarListView } from "@/components/portals/client/sessions/calendar-list-view"
import { Button } from "@/components/ui/button"

export type SessionEvent = {
  kind: EventKind
  id: string
  programmeName: string
  memberName: string
  venueName: string
  date: string // ISO date
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled"
  coachNotes: string | null
  curriculumCovered: string[]
  attendanceStatus: "present" | "absent" | "late" | "excused" | null
}

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "list", label: "List" },
]

export function ScheduleCalendar({ sessions }: { sessions: SessionEvent[] }) {
  const [view, setView] = useState<ViewMode>("month")
  const [cursorDate, setCursorDate] = useState(new Date())

  const visibleDays = getVisibleDays(view, cursorDate)
  const headerLabel = getHeaderLabel(view, cursorDate)

  return (
    <div className="flex flex-col gap-6">
      {/* View toggle + navigation */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex rounded-md border border-border p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === v.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view !== "list" && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous"
              onClick={() => setCursorDate((d) => getPrevDate(view, d))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursorDate(new Date())}
              className="h-8 px-2.5 text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Next"
              onClick={() => setCursorDate((d) => getNextDate(view, d))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </div>

      {/* Period label, calendar views only */}
      {view !== "list" && (
        <div className="text-sm font-medium text-foreground">{headerLabel}</div>
      )}

      {view === "month" && (
        <CalendarMonthView
          days={visibleDays}
          cursorDate={cursorDate}
          sessions={sessions}
        />
      )}

      {view === "week" && (
        <CalendarWeekView days={visibleDays} sessions={sessions} />
      )}

      {view === "list" && <CalendarListView sessions={sessions} />}
    </div>
  )
}
