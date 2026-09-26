"use client"

import { useState } from "react"
import {
  getHeaderLabel,
  getNextDate,
  getPrevDate,
  getVisibleDays,
  type ViewMode,
} from "@/lib/schedule"
import { exportScheduleToCsv } from "@/lib/export-schedule"
import { CalendarToolbar } from "@/components/portals/client/sessions/calendar-toolbar"
import { CalendarMonthView } from "@/components/portals/client/sessions/calendar-month-view"
import { CalendarWeekView } from "@/components/portals/client/sessions/calendar-week-view"
import { CalendarListView } from "@/components/portals/client/sessions/calendar-list-view"
import { SessionDetailPanel } from "@/components/portals/client/sessions/session-detail-panel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Download,
  Share2,
  Link2,
  FileText,
  MessageSquare,
  Mail,
} from "lucide-react"

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

  // ── Integration handlers (stubs for now) ──────────────────────────────
  function handleExportCsv() {
    exportScheduleToCsv(sessions)
  }

  function handleSubscribeIcs() {
    // TODO: generate .ics feed URL for this account and copy / open it
    console.log("Subscribe to iCal feed")
  }

  function handleCopyLink() {
    // TODO: generate a shareable calendar link
    console.log("Copy shareable schedule link")
  }

  function handleShareWhatsapp() {
    console.log("Share via WhatsApp")
  }

  function handleShareEmail() {
    console.log("Share via email")
  }

  function handleAddToGoogle() {
    // TODO: deep link to Google Calendar with the visible range
    console.log("Add visible range to Google Calendar")
  }

  return (
    <div className="flex flex-col gap-4">
      <CalendarToolbar
        view={view}
        headerLabel={headerLabel}
        onViewChange={setView}
        onPrev={() => setCursorDate((d) => getPrevDate(view, d))}
        onNext={() => setCursorDate((d) => getNextDate(view, d))}
        onToday={() => setCursorDate(new Date())}
        onExport={handleExportCsv}
      />

      {/* Integrations row */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md text-xs"
            >
              <Share2 className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Share schedule
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLink}>
              <Link2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareWhatsapp}>
              <MessageSquare className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareEmail}>
              <Mail className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md text-xs"
            >
              <Calendar className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
              Sync calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Sync to
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddToGoogle}>
              <Calendar className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscribeIcs}>
              <Calendar className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Apple Calendar (.ics)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscribeIcs}>
              <Calendar className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Outlook (.ics)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSubscribeIcs}>
              <Link2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Subscribe to feed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-md text-xs"
          onClick={handleExportCsv}
        >
          <Download className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
          Export CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-md text-xs"
          onClick={() => console.log("Print schedule")}
        >
          <FileText className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
          Print
        </Button>
      </div>

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
