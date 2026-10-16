"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled"
  coachNotes: string | null
  curriculumCovered: string[]
  attendanceStatus: "present" | "absent" | "late" | "excused" | null
}

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium w-fit text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export function ScheduleCalendar({ sessions }: { sessions: SessionEvent[] }) {
  const [view, setView] = useState<ViewMode>("month")
  const [cursorDate, setCursorDate] = useState(new Date())

  const visibleDays = getVisibleDays(view, cursorDate)
  const headerLabel = getHeaderLabel(view, cursorDate)

  return (
    <Tabs
      value={view}
      onValueChange={(v) => setView(v as ViewMode)}
      className="flex w-full min-w-0 flex-col gap-5"
    >
      {/* Tab list + navigation */}
      <div className="flex items-center justify-between gap-2">
        <TabsList className="no-scrollbar h-auto w-fit justify-start gap-1 overflow-x-auto rounded-lg bg-input p-1">
          <TabsTrigger value="week" className={TAB_TRIGGER_CLASS}>
            Week
          </TabsTrigger>
          <TabsTrigger value="month" className={TAB_TRIGGER_CLASS}>
            Month
          </TabsTrigger>
          <TabsTrigger value="list" className={TAB_TRIGGER_CLASS}>
            List
          </TabsTrigger>
        </TabsList>

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
        <div className="-mt-2 text-sm font-medium text-foreground">
          {headerLabel}
        </div>
      )}

      <TabsContent value="month" className="mt-0">
        <CalendarMonthView
          days={visibleDays}
          cursorDate={cursorDate}
          sessions={sessions}
        />
      </TabsContent>

      <TabsContent value="week" className="mt-0">
        <CalendarWeekView days={visibleDays} sessions={sessions} />
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <CalendarListView sessions={sessions} />
      </TabsContent>
    </Tabs>
  )
}
