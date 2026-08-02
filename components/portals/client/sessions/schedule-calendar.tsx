"use client"

import { useState } from "react"
import {
  getHeaderLabel,
  getNextDate,
  getPrevDate,
  getVisibleDays,
  type ViewMode,
} from "@/lib/schedule"
import { CalendarToolbar } from "@/components/portals/client/sessions/calendar-toolbar"
import { CalendarMonthView } from "@/components/portals/client/sessions/calendar-month-view"
import { CalendarWeekView } from "@/components/portals/client/sessions/calendar-week-view"
import { CalendarListView } from "@/components/portals/client/sessions/calendar-list-view"
import { SessionDetailPanel } from "@/components/portals/client/sessions/session-detail-panel"

export type SessionEvent = {
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

export function ScheduleCalendar({ sessions }: { sessions: SessionEvent[] }) {
  const [view, setView] = useState<ViewMode>("month")
  const [cursorDate, setCursorDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<SessionEvent | null>(
    null
  )
  const [panelOpen, setPanelOpen] = useState(false)

  function openSession(session: SessionEvent) {
    setSelectedSession(session)
    setPanelOpen(true)
  }

  const visibleDays = getVisibleDays(view, cursorDate)
  const headerLabel = getHeaderLabel(view, cursorDate)

  return (
    <div className="flex flex-col gap-4">
      <CalendarToolbar
        view={view}
        headerLabel={headerLabel}
        onViewChange={setView}
        onPrev={() => setCursorDate((d) => getPrevDate(view, d))}
        onNext={() => setCursorDate((d) => getNextDate(view, d))}
        onToday={() => setCursorDate(new Date())}
      />

      {view === "month" && (
        <CalendarMonthView
          days={visibleDays}
          cursorDate={cursorDate}
          sessions={sessions}
          onSelectSession={openSession}
        />
      )}

      {view === "week" && (
        <CalendarWeekView
          days={visibleDays}
          sessions={sessions}
          onSelectSession={openSession}
        />
      )}

      {view === "list" && (
        <CalendarListView sessions={sessions} onSelectSession={openSession} />
      )}

      <SessionDetailPanel
        session={selectedSession}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  )
}
