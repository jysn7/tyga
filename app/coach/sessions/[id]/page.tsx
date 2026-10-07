"use client"

import { useParams, useSearchParams, notFound } from "next/navigation"
import Link from "next/link"
import { CalendarDays, ChevronLeft, Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "@/components/portals/shared/loader"
import { SessionNotesTab } from "@/components/portals/shared/coach/SessionNotesTab"
import { SessionRosterTab } from "@/components/portals/shared/coach/SessionRosterTab"
import { SessionsOverviewTab } from "@/components/portals/shared/coach/SessionsOverviewTab"
import { useCoachSessionDetail } from "@/hooks/coach/use-sessions"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function CoachSessionDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const sessionId = Number(params.id)
  const { data: detail, isLoading, error } = useCoachSessionDetail(sessionId)

  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) notFound()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    )
  }
  if (error || !detail) notFound()

  const startTime =
    detail.start_time && detail.start_time.length >= 5
      ? detail.start_time.slice(0, 5)
      : null
  const endTime =
    detail.end_time && detail.end_time.length >= 5
      ? detail.end_time.slice(0, 5)
      : null
  const startsAt =
    detail.session_date && detail.start_time
      ? new Date(`${detail.session_date}T${detail.start_time}`)
      : null
  const hasStarted =
    startsAt !== null &&
    Number.isFinite(startsAt.getTime()) &&
    startsAt <= new Date()
  const isCancelled = detail.status === "cancelled"
  const readOnly = !hasStarted || isCancelled
  const focus = searchParams.get("focus")
  const initialTab =
    focus === "overview" || focus === "curriculum" ? focus : "roster"

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/coach/sessions"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sessions / {detail.programme_name}
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
          <CalendarDays
            className="h-4.5 w-4.5 text-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {detail.programme_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock
                className="h-3 w-3"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {startTime && endTime
                ? `${startTime} – ${endTime}`
                : "Time unavailable"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin
                className="h-3 w-3"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {detail.venue_name ?? "Venue unavailable"}
            </span>
            <span className="flex items-center gap-1">
              <Users
                className="h-3 w-3"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {detail.enrolled_count} enrolled
            </span>
          </div>
        </div>
        {readOnly && (
          <Button variant="outline" size="sm" disabled>
            {isCancelled ? "Cancelled" : "Not started"}
          </Button>
        )}
      </div>

      <Tabs defaultValue={initialTab} className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="roster" className={TAB_TRIGGER_CLASS}>
            Roster & attendance
          </TabsTrigger>
          <TabsTrigger value="curriculum" className={TAB_TRIGGER_CLASS}>
            Notes & curriculum
          </TabsTrigger>
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="roster"
          className="mt-0 data-[state=inactive]:hidden"
        >
          <SessionRosterTab
            sessionId={sessionId}
            readOnly={readOnly}
            isCancelled={isCancelled}
          />
        </TabsContent>

        <TabsContent
          value="curriculum"
          className="mt-0 data-[state=inactive]:hidden"
        >
          <SessionNotesTab
            key={sessionId}
            sessionId={sessionId}
            initialNotes={detail.coach_notes ?? ""}
            readOnly={readOnly}
            isCancelled={isCancelled}
          />
        </TabsContent>

        <TabsContent value="overview" className="mt-0">
          <SessionsOverviewTab detail={detail} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
