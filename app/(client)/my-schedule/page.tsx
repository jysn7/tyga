"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useParentSchedule,
  type ScheduleEntry,
} from "@/hooks/shared/use-schedule"
import { useMembers } from "@/hooks/use-members"
import { KIND_STYLES, type EventKind } from "@/lib/schedule"
import {
  ScheduleCalendar,
  type SessionEvent,
} from "@/components/portals/client/sessions/schedule-calendar"

function toSessionEvents(entries: ScheduleEntry[]): SessionEvent[] {
  return entries.map((e) => {
    const start = new Date(e.startsAt)
    const end = new Date(e.endsAt)

    return {
      id: String(e.rawId),
      kind: e.kind === "programme_session" ? "session" : "appointment",
      programmeName: e.title,
      memberName: "",
      venueName: e.subtitle,
      date: format(start, "yyyy-MM-dd"),
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      status:
        e.status === "cancelled"
          ? "cancelled"
          : e.status === "completed"
            ? "completed"
            : "scheduled",
      coachNotes: null,
      curriculumCovered: [],
      attendanceStatus: null,
    }
  })
}

export default function ParentSchedulePage() {
  const [memberFilter, setMemberFilter] = useState("all")
  const { data: members } = useMembers()

  const { from, to } = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 1)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 3)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [])

  const memberId = memberFilter === "all" ? null : Number(memberFilter)
  const { data, isLoading, error } = useParentSchedule(from, to, memberId)

  const sessions = useMemo(() => toSessionEvents(data ?? []), [data])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Schedule"
        description="Your children's programme sessions and appointments"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {members && members.length > 1 ? (
          <Select
            value={memberFilter}
            onValueChange={(v) => setMemberFilter(v ?? "all")}
          >
            <SelectTrigger className="h-9 w-full text-sm sm:w-44">
              <SelectValue placeholder="All children">
                {memberFilter === "all"
                  ? "All children"
                  : members.find((m) => m.id === memberFilter)?.fullName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All children</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {(Object.keys(KIND_STYLES) as EventKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${KIND_STYLES[k].dot}`} />
              {KIND_STYLES[k].label}
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing scheduled"
          description="Programme sessions and appointments appear here."
        />
      ) : (
        <ScheduleCalendar sessions={sessions} />
      )}
    </div>
  )
}
