"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  MinusCircle,
  Save,
  Loader2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useState } from "react"
import {
  useCoachSessionDetail,
  useCoachSessionRoster,
  useCoachSessionCurriculum,
} from "@/hooks/coach/use-coach-session-detail"
import {
  useMarkAttendance,
  useBulkMarkAttendance,
  useSaveSessionNotes,
} from "@/hooks/coach/use-coach-mutations"

const STATUS_OPTIONS = [
  {
    value: "present",
    label: "Present",
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "late",
    label: "Late",
    icon: Clock3,
    color: "text-orange",
    bg: "bg-orange/10",
  },
  {
    value: "excused",
    label: "Excused",
    icon: MinusCircle,
    color: "text-muted-foreground",
    bg: "bg-input",
  },
  {
    value: "absent",
    label: "Absent",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
] as const

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function CoachSessionDetailPage() {
  const params = useParams<{ id: string }>()
  const sessionId = Number(params.id)

  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useCoachSessionDetail(sessionId)

  if (detailLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    )
  }
  if (detailError || !detail) notFound()

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/coach/sessions"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        sessions / {detail.programme_name}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
          <CalendarDays
            className="h-4.5 w-4.5 text-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {detail.programme_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              {detail.start_time.slice(0, 5)} – {detail.end_time.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={1.75} />
              {detail.venue_name}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" strokeWidth={1.75} />
              {detail.enrolled_count} enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="roster" className={TAB_TRIGGER_CLASS}>
            Roster & attendance
          </TabsTrigger>
          <TabsTrigger value="curriculum" className={TAB_TRIGGER_CLASS}>
            Notes & curriculum
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-0">
          <section className="flex flex-col rounded-xl bg-card p-5 shadow">
            <h2 className="pb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Session details
            </h2>
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Programme</span>
                <span className="text-sm text-foreground">
                  {detail.programme_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm text-foreground">
                  {detail.start_time.slice(0, 5)} –{" "}
                  {detail.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Venue</span>
                <span className="text-sm text-foreground">
                  {detail.venue_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Enrolled</span>
                <span className="text-sm text-foreground">
                  {detail.enrolled_count}
                </span>
              </div>
              {detail.max_ratio && (
                <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-xs text-muted-foreground">
                    Max ratio
                  </span>
                  <span className="text-sm text-foreground">
                    1:{detail.max_ratio}
                  </span>
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        {/* ROSTER */}
        <TabsContent value="roster" className="mt-0">
          <RosterTab sessionId={sessionId} />
        </TabsContent>

        {/* CURRICULUM */}
        <TabsContent value="curriculum" className="mt-0">
          <CurriculumTab sessionId={sessionId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------- Roster ----------

function RosterTab({ sessionId }: { sessionId: number }) {
  const { data: roster, isLoading } = useCoachSessionRoster(sessionId)
  const mark = useMarkAttendance()
  const bulk = useBulkMarkAttendance()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (!roster || roster.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
          <Users
            className="h-4.5 w-4.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">
          No enrolled members
        </span>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Roster ({roster.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          disabled={bulk.isPending}
          onClick={() => bulk.mutate({ sessionId, status: "present" })}
          className="h-8 text-xs"
        >
          {bulk.isPending ? "Marking…" : "Mark all present"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow">
        <div className="flex flex-col divide-y divide-border/60">
          {roster.map((m) => (
            <div
              key={m.member_id}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <span className="truncate text-sm font-medium text-foreground">
                {m.full_name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = m.attendance_status === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={mark.isPending}
                      onClick={() =>
                        mark.mutate({
                          sessionId,
                          memberId: m.member_id,
                          status: opt.value,
                        })
                      }
                      title={opt.label}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        isActive
                          ? `${opt.bg} ${opt.color}`
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- Curriculum ----------

function CurriculumTab({ sessionId }: { sessionId: number }) {
  const { data: modules, isLoading } = useCoachSessionCurriculum(sessionId)
  const saveNotes = useSaveSessionNotes()
  const [notes, setNotes] = useState("")

  function handleSave() {
    saveNotes.mutate(
      { sessionId, notes },
      {
        onSuccess: () =>
          toast.add({
            title: "Notes saved",
            type: "success",
            timeout: 3000,
          }),
        onError: (err) =>
          toast.add({
            title: "Failed to save notes",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Curriculum
          </h2>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? ""
              : `${modules?.filter((m) => m.is_tagged).length ?? 0} tagged`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        ) : !modules || modules.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow">
            <p className="text-sm text-muted-foreground">
              No curriculum modules for this level.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow">
            <div className="flex flex-col divide-y divide-border/60">
              {modules.map((mod) => (
                <div
                  key={mod.module_id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm text-foreground">
                      {mod.module_name}
                    </span>
                    {mod.category && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {mod.category}
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      mod.is_tagged
                        ? "bg-primary/10 text-primary"
                        : "bg-input text-muted-foreground"
                    }`}
                  >
                    {mod.is_tagged ? "Tagged" : "Not tagged"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Session notes
        </h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What happened in this session?"
          className="min-h-32 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
        />
        <Button
          onClick={handleSave}
          disabled={saveNotes.isPending}
          className="h-11 w-fit gap-2 px-5 text-sm"
        >
          {saveNotes.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          Save notes
        </Button>
      </section>
    </div>
  )
}
